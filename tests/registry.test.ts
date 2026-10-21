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
    const rest = { ...okMeta }
    delete rest.inspiration
    expect(MetaSchema.safeParse(rest).success).toBe(false)
  })
})

describe("MetaSchema controls", () => {
  it("accepts number, boolean and select controls", () => {
    const controls = [
      { prop: "layers", type: "number", min: 2, max: 16, step: 1, default: 8 },
      { prop: "tint", type: "boolean", default: false },
      { prop: "curve", type: "select", options: ["linear", "exponential"], default: "exponential" },
    ]
    expect(MetaSchema.safeParse({ ...okMeta, controls }).success).toBe(true)
  })
  it("rejects a number control without a range", () => {
    expect(MetaSchema.safeParse({ ...okMeta, controls: [{ prop: "x", type: "number", default: 1 }] }).success).toBe(false)
  })
  it("rejects a select default that is not one of the options", () => {
    expect(MetaSchema.safeParse({ ...okMeta, controls: [{ prop: "c", type: "select", options: ["a", "b"], default: "z" }] }).success).toBe(false)
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
