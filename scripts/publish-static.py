"""Publish only the static export using PutObject; never delete or change AWS resources."""
import mimetypes
from pathlib import Path
import subprocess

BUCKET = "dililu-site-320169806724-prod"
ROOT = Path("out").resolve()
if not (ROOT / "index.html").is_file():
    raise SystemExit("Missing static export")

uploads = []
for path in sorted(ROOT.rglob("*")):
    if path.is_symlink():
        raise SystemExit("Symlinks are not publishable")
    if not path.is_file():
        continue
    key = path.relative_to(ROOT).as_posix()
    if any(part.startswith(".") or part in ("docs", "content", "node_modules") for part in path.relative_to(ROOT).parts):
        raise SystemExit(f"Private path in export: {key}")
    if path.suffix.lower() not in {".html", ".txt", ".js", ".css", ".json", ".xml", ".ico", ".svg", ".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".woff", ".woff2", ".ttf"}:
        raise SystemExit(f"Unexpected export type: {key}")
    mime = {".js": "application/javascript", ".html": "text/html; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".css": "text/css; charset=utf-8"}.get(path.suffix) or mimetypes.guess_type(key)[0] or "application/octet-stream"
    cache = "public,max-age=31536000,immutable" if key.startswith("_next/static/") else "public,max-age=0,must-revalidate"
    uploads.append((path, key, mime, cache))
    # S3 REST origins do not resolve extensionless routes or directory indexes.
    if path.suffix == ".html" and key != "index.html":
        route = key[:-5]
        uploads.extend((path, alias, mime, cache) for alias in (route, route + "/"))

# Upload dependencies first, then HTML, then the home entry point.
uploads.sort(key=lambda item: (item[1] == "index.html", item[0].suffix == ".html", item[1]))
for path, key, mime, cache in uploads:
    subprocess.run(["aws", "s3api", "put-object", "--bucket", BUCKET, "--key", key,
                    "--body", str(path), "--content-type", mime, "--cache-control", cache,
                    "--no-cli-pager"], check=True, stdout=subprocess.DEVNULL)
print(f"Upload PASS: {len(uploads)} objects, bucket {BUCKET}; no deletions")
