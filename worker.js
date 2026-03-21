export default {
  async fetch(req, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    // Preflight CORS
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Health check
    if (req.method === "GET") {
      return new Response("NutriLent API funcionando 🚀", { headers: corsHeaders });
    }

    if (req.method !== "POST") {
      return new Response("Método no permitido", { status: 405, headers: corsHeaders });
    }

    try {
      const body = await req.json();

      if (!body.messages || !Array.isArray(body.messages)) {
        return new Response(JSON.stringify({ error: "messages requerido" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const userMessage = body.messages[0];
      let base64Image = null;
      let mediaType = "image/jpeg";
      let promptText = "";

      for (const part of userMessage.content) {
        if (part.type === "image") {
          base64Image = part.source.data;
          mediaType = part.source.media_type || "image/jpeg";
        }
        if (part.type === "text") {
          promptText = part.text;
        }
      }

      if (!base64Image) {
        return new Response(JSON.stringify({ error: "Imagen no enviada" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // Llamada a Anthropic
      const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 700,
          messages: [{
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: base64Image }
              },
              {
                type: "text",
                text: promptText
              }
            ]
          }]
        })
      });

      const data = await anthropicRes.json();

      if (!anthropicRes.ok) {
        return new Response(JSON.stringify({ error: data.error?.message || "Error de Anthropic" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const text = data.content?.[0]?.text || "";

      if (!text) {
        return new Response(JSON.stringify({ error: "Respuesta vacía de la IA" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify({ text }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};
