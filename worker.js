export default {
  async fetch(request, env) {

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const { image } = await request.json();

    return new Response(JSON.stringify({
      plato: "Prueba",
      proteinas: 10,
      carbos: 20,
      grasas: 5,
      consejo: "Esto es solo una prueba"
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  }
}
