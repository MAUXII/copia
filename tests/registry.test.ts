import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { MetaSchema } from "@/lib/schema"
import { getComponent, getComponents, readSource } from "@/lib/registry"

const ROOT = "tests/fixtures/registry"
const okMeta = JSON.parse(readFileSync(`${ROOT}/ok-button/meta.json`, "utf8"))

describe("MetaSchema", () => {
  it("accepts the fixture", () => {
    expect(MetaSchema.safeParse(okMeta).success).toBe(true)
  })
  it("rejects unknown category", () => {
    expect(MetaSchema.safeParse({ ...okMeta, category: "misc" }).success).toBe(false)
  })
  it("rejects a non kebab-case slug", () => {
    expect(MetaSchema.safeParse({ ...okMeta, slug: "Magnetic Button" }).success).toBe(false)
  })
  it("rejects missing inspiration", () => {
    const { inspiration: _, ...rest } = okMeta
    expect(MetaSchema.safeParse(rest).success).toBe(false)
  })
})

describe("registry reader", () => {
  it("lists components", () => {
    const items = getComponents(ROOT)
    expect(items).toHaveLength(1)
    expect(items[0].slug).toBe("ok-button")
  })
  it("returns null for unknown slug", () => {
    expect(getComponent("nope", ROOT)).toBeNull()
  })
  it("reads component and demo source", () => {
    expect(readSource("ok-button", "component", ROOT)).toContain("export function OkButton")
    expect(readSource("ok-button", "demo", ROOT)).toContain("export default function Demo")
  })
})
