import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { ROOT } from "../scripts/repository.mjs";
import { generateRecordHtml } from "../shared/core.js";

const port = Number(process.env.PORT || 4173);
const previewDir = path.join(ROOT, "tests", "fixtures", "previews");
const ids = Array.from({ length: 25 }, (_, index) => `Demo${String(index + 1).padStart(4, "0")}`);
const titles = [
  "Designing Quiet Software That Lasts", "A Field Guide to Better Interfaces", "Notes on Focused Creative Work",
  "Building Resilient Static Systems", "A Slow Journey Along the Coast", "Typography for Thoughtful Products",
  "Practical Browser Testing Patterns", "The Architecture of Useful Notes", "Small Tools With Lasting Value",
  "Exploring Mountain Trails in Autumn", "Readable Code for Everyday Teams", "A Better Personal Knowledge Archive"
];
const descriptions = [
  "A short, useful memory cue.",
  "A deliberately long description that should remain quiet and readable while being visually clamped to exactly two lines inside the fixed journal card geometry. ".repeat(4),
  "L".repeat(1000),
  "(no description)",
  "A controlled visual fixture for the journal experience"
];

createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  if (url.pathname.startsWith("/capture/")) return captureFixture(response, url.pathname);
  if (url.pathname === "/links.txt") return send(response, 200, "text/plain; charset=utf-8", `${ids.join("\n")}\n`);
  const record = url.pathname.match(/^\/lnk\/(Demo\d{4})\/index\.html$/);
  if (record) {
    const id = record[1], index = ids.indexOf(id), title = titles[index % titles.length];
    const base = `http://127.0.0.1:${port}/lnk/${id}/`;
    const html = generateRecordHtml({ id, targetUrl: `https://example.com/articles/${index + 1}`, createdAt: new Date(Date.UTC(2026, 7, 16 - (index % 15), 12)).toISOString().replace(".000", ""), title, description: descriptions[index % descriptions.length], shortUrl: base, previewUrl: `${base}preview.jpg` });
    return send(response, 200, "text/html; charset=utf-8", html);
  }
  const preview = url.pathname.match(/^\/lnk\/Demo(\d{4})\/preview\.jpg$/);
  if (preview) return stream(response, path.join(previewDir, `${(Number(preview[1]) - 1) % 6 + 1}.jpg`), "image/jpeg");
  const staticPath = path.resolve(ROOT, url.pathname.replace(/^\/+/, "") || "index.html");
  if (!staticPath.startsWith(ROOT + path.sep)) return send(response, 403, "text/plain", "Forbidden");
  const type = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" }[path.extname(staticPath)] || "application/octet-stream";
  return stream(response, staticPath, type);
}).listen(port, "127.0.0.1", () => console.log(`Fixture journal at http://127.0.0.1:${port}/`));

function send(response, status, type, body) { response.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" }); response.end(body); }
async function stream(response, file, type) { try { const info = await stat(file); if (!info.isFile()) throw new Error(); response.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" }); createReadStream(file).pipe(response); } catch { send(response, 404, "text/plain", "Not found"); } }

function captureFixture(response, pathname) {
  const barrier = pathname.endsWith("/barrier");
  const unusable = pathname.endsWith("/unusable");
  const overlay = pathname.endsWith("/overlay");
  const long = pathname.endsWith("/long");
  const body = barrier ? '<main><h1>Sign in</h1><form><label>Password <input type="password"></label><button>Sign in</button></form></main>'
    : unusable ? '<main style="height:1000px;display:grid;place-items:center"><span aria-label="loading">·</span></main>'
    : `<header style="height:120px;background:#172430;color:white;padding:30px 90px">Fixture Magazine</header>
       ${overlay ? '<div role="dialog" aria-modal="true" style="position:fixed;z-index:99;inset:160px 50px;background:white;padding:80px"><h2>Cookies</h2><p>Choose how optional cookies are used.</p><button>Reject all</button></div>' : ''}
       <article style="width:1200px;min-height:730px;margin:80px auto;padding:55px 70px;background:#f5edda;color:#192a2f">
         <h1 style="font:64px Georgia;margin:0 0 28px">A Clear Guide to Thoughtful Static Software</h1>
         <p style="font:25px/1.5 Georgia;max-width:900px">Small dependable tools can create lasting value when their boundaries are explicit, their files remain inspectable, and their interfaces respect the reader.</p>
         <svg width="500" height="240" viewBox="0 0 500 240" role="img" aria-label="abstract landscape"><rect width="500" height="240" fill="#8db2ad"/><circle cx="380" cy="70" r="46" fill="#d88f56"/><path d="M0 220L170 80l90 95 70-60 170 105" fill="#274d50"/></svg>
       </article>${long ? '<div style="height:60000px"></div>' : ''}`;
  const html = `<!doctype html><html><head><title>🚀 Fixture Article — 日本語 & Русский 2026</title><meta property="og:title" content="🚀 Fixture Article — 日本語 & Русский 2026"><meta name="description" content="A controlled fixture — with stable metadata & visible content 2026"></head><body style="margin:0;background:#dbe4df;font-family:Arial">${body}</body></html>`;
  send(response, 200, "text/html; charset=utf-8", html);
}
