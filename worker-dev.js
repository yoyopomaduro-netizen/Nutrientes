const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

function extractDishName(text) {
  const jsonMatch = text.match(/\{[\s\S]*"plato"\s*:\s*"([^"]+)"[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[1].replace(/[*_#]/g, '').trim();

  const mdMatch = text.match(/(?:Nombre del\s+)?\*{0,2}Plato\*{0,2}\s*:\s*([^\n]+)/i);
  if (mdMatch && mdMatch[1].length < 80) return mdMatch[1].replace(/[*_#]/g, '').trim();

  const recipeMatch = text.match(/(?:Receta|Recipe|Dish)(?:\s*de|\s*:)?\s*\*{0,2}([A-ZÁÉÍÓÚÑ][^.\n]{3,60})/i);
  if (recipeMatch) return recipeMatch[1].trim();

  const lines = text.split('\n').filter(l => l.trim());
  const foodWords = ['arroz', 'pasta', 'carne', 'pescado', 'ensalada', 'sopa', 'guiso',
    'tacos', 'arepa', 'pizza', 'burger', 'rice', 'chicken', 'salad', 'soup', 'pasta',
    'steak', 'salmon', 'curry', 'noodles'];
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (foodWords.some(w => lower.includes(w)) && line.length < 100) {
      return line.replace(/^[*\s#]+/, '').trim();
    }
  }

  return null;
}

function arrayBufferToBase64(buffer) {
  if (buffer instanceof ArrayBuffer || buffer instanceof Uint8Array) {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  return '';
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      });
    }

    const DEEPSEEK_API_KEY = env.DEEPSEEK_API_KEY;
    if (!DEEPSEEK_API_KEY) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // ──────────────────────────────────────────────
      // /api/chat — CON OPTIMIZACIÓN DE CONTEXT CACHING
      // ──────────────────────────────────────────────
      if (path === '/api/chat' || path === '/') {
        const body = await request.json();
        const { messages, system, model, max_tokens, temperature, stream } = body;

        if (!messages || !Array.isArray(messages)) {
          return new Response(JSON.stringify({ error: 'Messages array required' }), {
            status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
          });
        }

        const deepseekMessages = [];

        if (system) {
          deepseekMessages.push({ role: 'system', content: system });
        }

        for (const msg of messages) {
          deepseekMessages.push(msg);
        }

        const selectedModel = model || 'deepseek-chat';

        const deepseekBody = {
          model: selectedModel,
          messages: deepseekMessages,
          max_tokens: max_tokens || 2000,
          stream: stream || false
        };

        if (selectedModel !== 'deepseek-reasoner') {
          deepseekBody.temperature = temperature ?? 0.7;
        }

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + DEEPSEEK_API_KEY
          },
          body: JSON.stringify(deepseekBody)
        });

        const data = await response.json();

        const content = data?.choices?.[0]?.message?.content || '';
        if (content && env.AI) {
          const dishName = extractDishName(content);
          if (dishName) {
            try {
              const cleanName = dishName.replace(/[*_#]/g, '').trim();
              const imagePrompt = `A professional food photograph of ${cleanName}, studio lighting, appetizing, 4k, food photography, shallow depth of field, mouth-watering`;
              const aiResult = await env.AI.run('@cf/stabilityai/stable-diffusion-xl-base-1.0', { prompt: imagePrompt });

              let base64 = '';
              if (aiResult instanceof ReadableStream) {
                const reader = aiResult.getReader();
                const chunks = [];
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  chunks.push(value);
                }
                const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
                const concatenated = new Uint8Array(totalLength);
                let offset = 0;
                for (const chunk of chunks) {
                  concatenated.set(chunk, offset);
                  offset += chunk.length;
                }
                base64 = arrayBufferToBase64(concatenated.buffer);
              } else if (aiResult instanceof ArrayBuffer) {
                base64 = arrayBufferToBase64(aiResult);
              } else if (aiResult instanceof Uint8Array) {
                base64 = arrayBufferToBase64(aiResult.buffer);
              }

              if (base64) {
                data.choices[0].message.content = content + `\n\n![${cleanName}](data:image/png;base64,${base64})`;
              }
            } catch (imgErr) {
              console.error('Image generation failed, returning text only:', imgErr);
            }
          }
        }

        return new Response(JSON.stringify(data), {
          status: response.status,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
        });
      }

      // ──────────────────────────────────────────────
      // /api/analyze — Passthrough real (OpenAI/DeepSeek chat completions)
      // Recibe el body ya formateado con messages[] + image_url desde el cliente
      // ──────────────────────────────────────────────
      if (path === '/api/analyze') {
        const body = await request.json();
        const { messages, model, max_tokens, temperature, stream } = body;

        if (!messages || !Array.isArray(messages)) {
          return new Response(JSON.stringify({ error: 'Messages array required' }), {
            status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
          });
        }

        const selectedModel = model || 'deepseek-chat';
        const deepseekBody = {
          model: selectedModel,
          messages: messages,
          max_tokens: max_tokens || 300,
          temperature: temperature ?? 0.1,
          stream: stream || false
        };

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + DEEPSEEK_API_KEY
          },
          body: JSON.stringify(deepseekBody)
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
          status: response.status,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
        });
      }

      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      });
    }
  }
};
