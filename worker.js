export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Método no permitido", { status: 405 });
    }

    try {
      const body = await request.json();

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Eres un nutricionista experto. Responde SOLO en JSON válido."
            },
            {
              role: "user",
              content: body.messages[0].content
            }
          ],
          max_tokens: 500
        })
      });

      const data = await response.json();

      return new Response(JSON.stringify({
        content: [{ text: data.choices[0].message.content }]
      }), {
        headers: { "Content-Type": "application/json" }
      });

    } catch (err) {
      return new Response(JSON.stringify({
        error: { message: err.message }
      }), { status: 500 });
    }
  }
};
