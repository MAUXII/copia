import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { MetaSchema } from "@/lib/schema"
import { createComponent } from "@/lib/tooling/new-component"
import { buildRegistryJson } from "@/lib/tooling/build-registry"

let tmp: string
beforeEach(() => {
  tmp = mkdtempSync(path.join(tmpdir(), "copia-"))
})
afterEach(() => rmSync(tmp, { recursive: true, force: true }))

describe("createComponent", () => {
  it("creates the three files with a valid meta", () => {
    createComponent("my-thing", tmp)
    const dir = path.join(tmp, "my-thing")
    expect(existsSync(path.join(dir, "my-thing.tsx"))).toBe(true)
    expect(existsSync(path.join(dir, "demo.tsx"))).toBe(true)
    const meta = JSON.parse(readFileSync(path.join(dir, "meta.json"), "utf8"))
    expect(MetaSchema.safeParse(meta).success).toBe(true)
    expect(meta.slug).toBe("my-thing")
    expect(readFileSync(path.join(dir, "my-thing.tsx"), "utf8")).toContain("export function MyThing")
  })
  it("accepts a category and uses the local date", () => {
    createComponent("my-button", tmp, { category: "buttons" })
    const meta = JSON.parse(readFileSync(path.join(tmp, "my-button", "meta.json"), "utf8"))
    expect(meta.category).toBe("buttons")
    const now = new Date()
    const local = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
    expect(meta.createdAt).toBe(local)
  })
  it("rejects an unknown category", () => {
    expect(() => createComponent("my-thing", tmp, { category: "misc" })).toThrow(/category/)
  })
  it("rejects a non kebab-case slug", () => {
    expect(() => createComponent("My Thing", tmp)).toThrow(/kebab-case/)
  })
  it("rejects a slug starting with a digit (not a valid component name)", () => {
    expect(() => createComponent("3d-card", tmp)).toThrow(/kebab-case/)
  })
  it("rejects a duplicate slug", () => {
    createComponent("my-thing", tmp)
    expect(() => createComponent("my-thing", tmp)).toThrow(/already exists/)
  })
})

describe("buildRegistryJson", () => {
  it("maps registry folders to shadcn items", () => {
    const json = buildRegistryJson("tests/fixtures/registry")
    expect(json.name).toBe("copia")
    expect(json.items[0]).toMatchObject({
      name: "ok-button",
      type: "registry:component",
      title: "OK Button",
      files: [{ path: "registry/ok-button/ok-button.tsx", type: "registry:component" }],
    })
  })
})
