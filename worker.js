export default {
  async fetch(req, env) {
    try {
      if (req.method !== "POST") {
        return new Response("Método no permitido", { status: 405 });
      }

      const body = await req.json();

      // Validación básica
      if (!body.messages || !Array.isArray(body.messages)) {
        return new Response(
          JSON.stringify({ error: "messages es requerido" }),
          { status: 400 }
        );
      }

      // Extraer imagen + texto del frontend
      const userMessage = body.messages[0];

      let base64Image = null;
      let promptText = "";

      for (const part of userMessage.content) {
        if (part.type === "image" && part.source?.data) {
          base64Image = part.source.data;
        }
        if (part.type === "text") {
          promptText = part.text;
        }
      }

      if (!base64Image) {
        return new Response(
          JSON.stringify({ error: "No se recibió imagen" }),
          { status: 400 }
        );
      }

      // Llamada a OpenAI (VISION)
      const response = await fetch("https://api.openai.com/v1/responses", {
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

      const data = await response.json();

      // Manejo de errores de OpenAI
      if (!response.ok) {
        return new Response(JSON.stringify(data), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" }
      });

    } catch (err) {
      return new Response(
        JSON.stringify({ error: err.message }),
        { status: 500 }
      );
    }
  }
};
