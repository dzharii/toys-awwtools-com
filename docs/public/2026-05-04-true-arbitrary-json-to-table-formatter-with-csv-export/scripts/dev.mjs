const port = Number(process.env.PORT || 4173);
const root = process.cwd();

const server = Bun.serve({
  port,
  async fetch(request) {
    const url = new URL(request.url);
    let path = url.pathname;
    if (path === "/") path = "/index.html";
    let file = Bun.file(`${root}${path}`);
    if (await file.exists()) {
      return new Response(file);
    }
    file = Bun.file(`${root}/public${path}`);
    if (await file.exists()) {
      return new Response(file);
    }
    return new Response("Not found", { status: 404 });
  }
});

console.log(`Dev server running at http://localhost:${server.port}`);
