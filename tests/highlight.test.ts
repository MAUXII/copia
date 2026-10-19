import { describe, expect, it } from "vitest"
import { EMBER_THEME, highlightCode } from "@/lib/highlight"

describe("highlightCode", () => {
  it("colors TSX keywords with the Ember accent", async () => {
    const html = await highlightCode('import { cn } from "@/lib/utils"\nexport function A() { return <div /> }', "tsx")
    expect(html).toContain("<pre")
    expect(html.toLowerCase()).toContain(EMBER_THEME.accent.toLowerCase())
  })
  it("escapes HTML in code", async () => {
    const html = await highlightCode('const s = "<script>"', "tsx")
    expect(html).not.toContain("<script>")
  })
})
