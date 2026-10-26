/** Static development/preview server; /editor/ also exercises subdirectory hosting. */
import { resolve, sep } from "node:path";
const root = resolve(import.meta.dir, "..", "dist");
const port = Number(process.env.PORT || 4173);
Bun.serve({
  port,
  async fetch(request) {
    let path: string;
    try {
      path = decodeURIComponent(new URL(request.url).pathname);
    } catch {
      return new Response("Invalid URL", { status: 400 });
    }
    if (path.startsWith("/editor/")) path = path.slice(7);
    if (path.endsWith("/")) path += "index.html";
    const target = resolve(root, "." + path.replaceAll("/", sep));
    if (!target.startsWith(root + sep)) return new Response("Forbidden", { status: 403 });
    const file = Bun.file(target);
    if (!(await file.exists())) return new Response("Not found", { status: 404 });
    return new Response(file, {
      headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
    });
  },
});
console.info(`Guided Document Editor: http://localhost:${port}/`);
