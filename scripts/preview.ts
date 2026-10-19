import { spawn, type ChildProcess } from "node:child_process"
import { writeFileSync } from "node:fs"
import { createServer } from "node:net"
import { buildDemosModule } from "../lib/tooling/build-registry"
import { recordPreview } from "../lib/tooling/record-preview"

const slug = process.argv[2]
if (!slug) {
  console.error("Usage: npm run preview <slug>")
  process.exit(1)
}

async function reachable(url: string) {
  try {
    return (await fetch(url)).ok
  } catch {
    return false
  }
}

/** First free port from 3123 up, so an unrelated server on 3123 does not block the recording. */
function freePort(start = 3123): Promise<number> {
  return new Promise((resolve) => {
    const probe = createServer()
    probe.once("error", () => resolve(freePort(start + 1)))
    probe.once("listening", () => probe.close(() => resolve(start)))
    probe.listen(start)
  })
}

function stop(server: ChildProcess | undefined) {
  if (!server?.pid) return
  if (process.platform === "win32") spawn("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" })
  else process.kill(-server.pid, "SIGTERM") // the whole process group, not just the shell
}

async function main() {
  // New components must be in lib/demos.ts before /preview/<slug> can render.
  writeFileSync("lib/demos.ts", buildDemosModule())

  let server: ChildProcess | undefined
  // PREVIEW_BASE_URL reuses a running dev server that already knows the component.
  let baseUrl = process.env.PREVIEW_BASE_URL ?? "http://localhost:3123"
  try {
    if (!(await reachable(`${baseUrl}/preview/${slug}`))) {
      const port = await freePort()
      baseUrl = `http://localhost:${port}`
      console.log(`Starting dev server on port ${port} for the recording…`)
      server = spawn("npx", ["next", "dev", "-p", String(port)], { stdio: "ignore", shell: true, detached: process.platform !== "win32" })
      const deadline = Date.now() + 120_000
      while (!(await reachable(`${baseUrl}/preview/${slug}`))) {
        if (Date.now() > deadline) throw new Error(`/preview/${slug} did not respond. Does registry/${slug} exist?`)
        await new Promise((r) => setTimeout(r, 1000))
      }
    }
    const { webp, mp4 } = await recordPreview(slug, { baseUrl, outDir: "public/previews" })
    console.log(`✓ ${mp4}\n✓ ${webp}`)
  } finally {
    stop(server)
  }
}

main().catch((error) => {
  console.error(`✗ ${(error as Error).message}`)
  process.exit(1)
})
