export default {
  async fetch(_request: Request): Promise<Response> {
    return new Response("OK", {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  },
};
