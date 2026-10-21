import { describe, expect, it } from "vitest"
import { componentName, generateJsx } from "@/lib/jsx"
import type { Control } from "@/lib/schema"

const controls: Control[] = [
  { prop: "layers", type: "number", min: 2, max: 16, step: 1, default: 8 },
  { prop: "tint", type: "boolean", default: false },
  { prop: "curve", type: "select", options: ["linear", "exponential"], default: "exponential" },
]

describe("generateJsx", () => {
  it("writes numbers in braces, true booleans bare, strings quoted", () => {
    expect(generateJsx("ProgressiveBlur", controls, { layers: 10, tint: true, curve: "linear" })).toBe(
      ['<ProgressiveBlur', '  layers={10}', '  tint', '  curve="linear"', '/>'].join("\n"),
    )
  })
  it("writes false booleans explicitly", () => {
    expect(generateJsx("ProgressiveBlur", controls, { layers: 8, tint: false, curve: "exponential" })).toContain("tint={false}")
  })
})

describe("componentName", () => {
  it("turns a slug into PascalCase", () => {
    expect(componentName("glow-border-button")).toBe("GlowBorderButton")
  })
})
