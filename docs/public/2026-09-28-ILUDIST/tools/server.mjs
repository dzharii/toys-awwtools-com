import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(process.argv[2] || '.');
const port = Number(process.env.PORT || 4173);
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.jpg':'image/jpeg','.png':'image/png','.md':'text/plain; charset=utf-8'};
http.createServer(async (req, res) => {
  try {
    const parts = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).split('/').filter(Boolean);
    if (parts.some(p => p.startsWith('experiment-') || p === 'node_modules' || p === '..')) {
      res.writeHead(403).end('Not served'); return;
    }
    let file = path.resolve(root, ...parts);
    if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    const bytes = await readFile(file);
    res.writeHead(200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-cache'});
    res.end(bytes);
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') res.writeHead(404).end('Not found');
    else { console.error(error); res.writeHead(500).end('Unable to read this resource'); }
  }
}).listen(port, '127.0.0.1', () => console.log(`ILUD at http://127.0.0.1:${port}`));
