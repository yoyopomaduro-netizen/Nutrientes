export default {
  async fetch(req, env) {

    if (req.method === "GET") {
      return new Response("NutriLent API funcionando 🚀");
    }

    if (req.method !== "POST") {
      return new Response("Método no permitido", { status: 405 });
    }

    // resto de tu lógica POST...
  }
};
