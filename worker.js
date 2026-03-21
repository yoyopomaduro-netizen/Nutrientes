export default {
  async fetch(req, env) {
    try {
      if (req.method !== "POST") {
        return new Response("Método no permitido", { status: 405 });
      }

      const body = await req.json();

      if (!body.messages || !Array.isArray(body.messages)) {
        return new Response(JSON.stringify({ error: "messages requerido" }), { status: 400 });
      }

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
        return new Response(JSON.stringify({ error: "Imagen no enviada" }), { status: 400 });
      }

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
        return new Response(JSON.stringify(data), { status: 500 });
      }

      // Extraer texto plano
      let text = "";

      if (data.output) {
        text = data.output
          .map(o =>
            o.content
              ?.map(c => c.text || "")
              .join("")
          )
          .join("");
      }

      return new Response(JSON.stringify({ text }), {
        headers: { "Content-Type": "application/json" }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500
      });
    }
  }
};
