export default {
  async fetch(req, env) {

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    // ✅ Preflight (CORS)
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    try {
      const url = new URL(req.url);

      // ✅ Health check
      if (req.method === "GET") {
        return new Response("NutriLent API funcionando 🚀", {
          headers: corsHeaders
        });
      }

      // ❌ Solo POST
      if (req.method !== "POST") {
        return new Response("Método no permitido", {
          status: 405,
          headers: corsHeaders
        });
      }

      const body = await req.json();

      if (!body.messages || !Array.isArray(body.messages)) {
        return new Response(JSON.stringify({ error: "messages requerido" }), {
          status: 400,
          headers: corsHeaders
        });
      }

      const userMessage = body.messages[0];

      let base64Image = null;
      let promptText = "";

      for (const part of userMessage.content) {
        if (part.type === "image") {
          base64Image = part.source.data;
        }
        if (part.type === "text") {
          promptText = part.text;
        }
      }

      if (!base64Image) {
        return new Response(JSON.stringify({ error: "Imagen no enviada" }), {
          status: 400,
          headers: corsHeaders
        });
      }

      // ✅ Llamada a OpenAI (Responses API con visión)
      const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          input: [
            {
              role: "user",
              content: [
                {
                  type: "input_image",
                  image_url: `data:image/jpeg;base64,${base64Image}`
                },
                {
                  type: "input_text",
                  text: promptText
                }
              ]
            }
          ],
          max_output_tokens: 700
        })
      });

      const data = await openaiResponse.json();

      if (!openaiResponse.ok) {
        return new Response(JSON.stringify(data), {
          status: 500,
          headers: corsHeaders
        });
      }

      // 🔍 DEBUG (ver en wrangler tail)
      console.log("OPENAI RESPONSE:", JSON.stringify(data, null, 2));

      // ✅ Extracción robusta del texto
      let text = "";

      if (data.output && Array.isArray(data.output)) {
        for (const item of data.output) {
          if (item.content && Array.isArray(item.content)) {
            for (const c of item.content) {
              if (c.text) text += c.text;
            }
          }
        }
      }

      if (!text && data.output_text) {
        text = data.output_text;
      }

      if (!text) {
        return new Response(JSON.stringify({
          error: "No se pudo extraer texto de la respuesta",
          raw: data
        }), {
          status: 500,
          headers: corsHeaders
        });
      }

      return new Response(JSON.stringify({ text }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });

    } catch (err) {
      return new Response(JSON.stringify({
        error: err.message
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
};
