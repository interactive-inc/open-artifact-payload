import { createReadStream } from "node:fs"
import { access } from "node:fs/promises"
import { createServer } from "node:http"
import { resolve, sep } from "node:path"

const root = resolve("storybook-static")
const port = Number(process.argv[2] ?? 6007)

const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
}

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url ?? "/", `http://${request.headers.host}`).pathname,
    )
    const relativePath = pathname === "/" ? "index.html" : pathname.slice(1)
    const filePath = resolve(root, relativePath)

    if (filePath !== root && !filePath.startsWith(`${root}${sep}`)) {
      response.writeHead(403).end("Forbidden")
      return
    }

    await access(filePath)
    const extension = filePath.slice(filePath.lastIndexOf("."))
    response.writeHead(200, {
      "Content-Type": contentTypes[extension] ?? "application/octet-stream",
    })
    createReadStream(filePath).pipe(response)
  } catch {
    response.writeHead(404).end("Not found")
  }
}).listen(port, "127.0.0.1")

console.log(`Serving Storybook static build at http://127.0.0.1:${port}`)
