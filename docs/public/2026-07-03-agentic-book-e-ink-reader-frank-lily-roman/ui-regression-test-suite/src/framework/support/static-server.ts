import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";

/**
 * A local static HTTP server that serves the E Ink Reader app directory (the
 * "built artifact" analog — the app is already static, no build step) plus the
 * suite's test fixtures, all from 127.0.0.1. Tests must never depend on the
 * public internet; the app itself ships connect-src 'self'.
 *
 * Fixtures are exposed under /__fixtures__/<name> so they share the app origin
 * and can be loaded through the file picker / drag-drop without any network.
 */
export interface StaticServer {
  readonly baseUrl: string;
  url(path: string): string;
  close(): Promise<void>;
}

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/rss+xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".markdown": "text/markdown; charset=utf-8",
  ".pdf": "application/pdf",
};

function contentType(filePath: string): string {
  return MIME[extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

/** Resolve a request path safely under a root, preventing directory traversal. */
function safeResolve(root: string, urlPath: string): string | null {
  const clean = decodeURIComponent(urlPath.split("?")[0]);
  const target = normalize(join(root, clean));
  const rootWithSep = root.endsWith(sep) ? root : root + sep;
  if (target !== root && !target.startsWith(rootWithSep)) return null;
  return target;
}

export interface StaticServerOptions {
  /** Absolute path to the app root directory (contains index.html). */
  readonly appRoot: string;
  /** Absolute path to the fixtures directory, served under /__fixtures__/. */
  readonly fixturesRoot: string;
}

export async function startStaticServer(options: StaticServerOptions): Promise<StaticServer> {
  const appRoot = resolve(options.appRoot);
  const fixturesRoot = resolve(options.fixturesRoot);

  const server: Server = createServer(async (req, res) => {
    try {
      const rawPath = (req.url ?? "/").split("?")[0];
      let root = appRoot;
      let relative = rawPath;

      if (rawPath.startsWith("/__fixtures__/")) {
        root = fixturesRoot;
        relative = rawPath.slice("/__fixtures__".length);
      }
      if (relative === "/" || relative === "") relative = "/index.html";

      const filePath = safeResolve(root, relative);
      if (!filePath) {
        res.writeHead(403).end("Forbidden");
        return;
      }

      const info = await stat(filePath).catch(() => null);
      const finalPath = info?.isDirectory() ? join(filePath, "index.html") : filePath;
      const body = await readFile(finalPath);
      res.writeHead(200, { "content-type": contentType(finalPath) });
      res.end(body);
    } catch {
      res.writeHead(404, { "content-type": "text/plain" }).end("Not found");
    }
  });

  await new Promise<void>((resolveListen, rejectListen) => {
    server.once("error", rejectListen);
    server.listen(0, "127.0.0.1", resolveListen);
  });

  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  return {
    baseUrl,
    url(path: string): string {
      return path.startsWith("/") ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
    },
    close(): Promise<void> {
      return new Promise<void>((resolveClose, rejectClose) => {
        server.close((error) => (error ? rejectClose(error) : resolveClose()));
      });
    },
  };
}
