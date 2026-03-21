export default {
  async fetch(req, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    };

    // 1. Manejo de Preflight CORS
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // 2. Health check rápido
    if (req.method === "GET") {
      return new Response("NutriLent API funcionando 🚀", { status: 200, headers: corsHeaders });
    }

    if (req.method !== "POST") {
      return new Response("Método no permitido", { status: 405, headers: corsHeaders });
    }

    try {
      const body = await req.json();

      // Validación de mensajes
      if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
        return new Response(JSON.stringify({ error: "Formato de mensajes inválido" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const userMessage = body.messages[0];
      let base64Image = null;
      let mediaType = "image/jpeg";
      let promptText = "";

      // Extraer texto e imagen del contenido
      if (Array.isArray(userMessage.content)) {
        for (const part of userMessage.content) {
          if (part.type === "image") {
            base64Image = part.source.data;
            mediaType = part.source.media_type || "image/jpeg";
          }
          if (part.type === "text") {
            promptText = part.text;
          }
        }
      } else {
        // Soporte básico por si envían solo texto
        promptText = userMessage.content;
      }

      if (!base64Image) {
        return new Response(JSON.stringify({ error: "No se encontró la imagen en la solicitud" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // 3. Llamada a Anthropic (Modelo corregido y optimizado)
      const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307", // <--- MODELO CORRECTO PARA TUS $5
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
                text: promptText || "Analiza nutricionalmente esta imagen." 
              }
            ]
          }]
        })
      });

      const data = await anthropicRes.json();

      // 4. Manejo de errores detallado de la API de Anthropic
      if (!anthropicRes.ok) {
        let errorMessage = data.error?.message || "Error desconocido en Anthropic";
        
        // Si el error es por falta de créditos, lo notificamos claro
        if (anthropicRes.status === 400 && errorMessage.includes("credit balance")) {
          errorMessage = "Saldo insuficiente en Anthropic. Por favor, recarga tu cuenta.";
        }

        return new Response(JSON.stringify({ error: errorMessage }), {
          status: anthropicRes.status, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // 5. Respuesta exitosa
      const text = data.content?.[0]?.text || "";

      return new Response(JSON.stringify({ text }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: "Error interno del Worker: " + err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};
