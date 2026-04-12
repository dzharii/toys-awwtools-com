const fs = require("fs");
const http = require("http");
const path = require("path");
const url = require("url");

const args = parseArgs(process.argv.slice(2));
const rootDir = path.resolve(args.root || path.join(__dirname, "..", ".."));
const port = Number(args.port || 4173);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

const server = http.createServer((request, response) => {
  const parsed = new url.URL(request.url, `http://${request.headers.host}`);

  if (parsed.pathname === "/__health") {
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
    response.end(JSON.stringify({ ok: true, pid: process.pid }));
    return;
  }

  const localPath = resolveRequestPath(parsed.pathname);
  if (!localPath || !fs.existsSync(localPath) || fs.statSync(localPath).isDirectory()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const ext = path.extname(localPath).toLowerCase();
  response.writeHead(200, {
    "Content-Type": contentTypes[ext] || "application/octet-stream",
    "Cache-Control": "no-store",
  });
  fs.createReadStream(localPath).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`SERVER_READY http://127.0.0.1:${port} root=${rootDir} pid=${process.pid}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}

function resolveRequestPath(pathname) {
  let candidate = pathname === "/" ? "/index.html" : pathname;
  candidate = decodeURIComponent(candidate);
  const normalized = path.normalize(candidate).replace(/^(\.\.[/\\])+/, "");
  const localPath = path.join(rootDir, normalized);
  if (!localPath.startsWith(rootDir)) return null;
  return localPath;
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    result[key] = argv[index + 1];
    index += 1;
  }
  return result;
}
