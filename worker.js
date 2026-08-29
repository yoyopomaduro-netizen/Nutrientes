const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

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
      // /api/chat — passthrough genérico (coach, nevera, plan semanal, resumen)
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

        return new Response(JSON.stringify(data), {
          status: response.status,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
        });
      }

      // /api/analyze — imagen + prompt nutricional
      if (path === '/api/analyze') {
        const body = await request.json();
        const { imageBase64, promptNutrition, max_tokens, temperature } = body;

        if (!imageBase64 || !promptNutrition) {
          return new Response(JSON.stringify({ error: 'imageBase64 and promptNutrition required' }), {
            status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
          });
        }

        const deepseekBody = {
          model: 'deepseek-chat',
          messages: [
            { role: 'user', content: [
              { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + imageBase64 } },
              { type: 'text', text: promptNutrition }
            ]}
          ],
          max_tokens: max_tokens || 300,
          temperature: temperature ?? 0.1,
          stream: false
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
