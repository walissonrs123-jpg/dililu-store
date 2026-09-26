import http from "node:http";
import path from "node:path";
import { readFile, stat } from "node:fs/promises";

// Loopback-only preview of the export; never exposes the repository root.
const root = path.resolve("out");
const types = { ".html": "text/html; charset=utf-8", ".js": "application/javascript", ".css": "text/css", ".txt": "text/plain", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".ico": "image/x-icon", ".xml": "application/xml", ".woff2": "font/woff2" };
http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname);
    const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+|\/+$/g, "");
    const candidate = path.resolve(root, relative);
    if (!candidate.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    let filename = candidate;
    if (!path.extname(relative) && relative !== "opengraph-image") filename += ".html";
    let info;
    try { info = await stat(filename); } catch (error) {
      // Next's Windows export nests RSC segments that Linux emits with dots.
      // Resolve the existing file without modifying the build or the application.
      const segment = relative.match(/^(.*\/)?(__next\.[^.]+)\.(.+)\.txt$/);
      if (!segment) throw error;
      filename = path.resolve(root, `${segment[1] || ""}${segment[2]}/${segment[3].replaceAll(".", "/")}.txt`);
      if (!filename.startsWith(root + path.sep)) throw error;
      info = await stat(filename);
    }
    res.writeHead(200, { "Content-Type": types[path.extname(filename)] || "image/png", "Content-Length": info.size });
    if (req.method === "HEAD") res.end(); else res.end(await readFile(filename));
  } catch { res.writeHead(404).end("Not found"); }
}).listen(4173, "127.0.0.1", () => console.log("Static preview http://127.0.0.1:4173"));
