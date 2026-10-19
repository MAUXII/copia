import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { createServer, type Server } from "node:http"
import { mkdtempSync, rmSync, existsSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import type { AddressInfo } from "node:net"
import { buildDemosModule } from "@/lib/tooling/build-registry"
import { recordPreview } from "@/lib/tooling/record-preview"
import { checkComponent } from "@/lib/check"

describe("buildDemosModule", () => {
  it("maps each slug to a lazy demo import", () => {
    const source = buildDemosModule("tests/fixtures/registry")
    expect(source).toContain(`"ok-button": () => import("@/tests/fixtures/registry/ok-button/demo")`)
  })
})

describe("recordPreview", () => {
  let server: Server
  let baseUrl: string
  let out: string

  beforeAll(async () => {
    out = mkdtempSync(path.join(tmpdir(), "copia-rec-"))
    server = createServer((req, res) => {
      res.setHeader("content-type", "text/html")
      res.end(`<body style="margin:0;background:#0b0b0c;display:grid;place-items:center;height:100vh">
        <button id="b" style="padding:16px 32px">${req.url}</button>
        <script>addEventListener("mousemove",e=>{b.style.transform="translate("+(e.clientX-640)/10+"px,"+(e.clientY-400)/10+"px)"})</script></body>`)
    })
    await new Promise<void>((r) => server.listen(0, r))
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
  })
  afterAll(() => {
    server.close()
    rmSync(out, { recursive: true, force: true })
  })

  it("writes webp and mp4 that pass the preview checks", async () => {
    const result = await recordPreview("ok-button", { baseUrl, outDir: out })
    expect(existsSync(result.webp)).toBe(true)
    expect(existsSync(result.mp4)).toBe(true)
    const previewProblems = checkComponent("tests/fixtures/registry/ok-button", out)
    expect(previewProblems).toEqual([])
  }, 90000)
})
