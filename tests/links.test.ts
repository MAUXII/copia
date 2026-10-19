import { describe, expect, it } from "vitest"
import { buildIssueUrl, isValidPrUrl, MAX_ISSUE_URL } from "@/lib/issues"
import { buildPrompt } from "@/lib/prompt"
import type { Meta } from "@/lib/schema"

const meta: Meta = {
  slug: "magnetic-button",
  name: "Magnetic Button",
  description: "Pulled toward the cursor.",
  category: "buttons",
  tags: [],
  author: { name: "Copia", github: "MAUXII" },
  inspiration: { author: "Olivier Larose", url: "https://blog.olivierlarose.com/tutorials/magnetic-button" },
  dependencies: ["motion"],
  props: [],
  createdAt: "2026-10-13",
}

describe("buildIssueUrl", () => {
  it("encodes special characters so they round-trip", () => {
    const body = "Line 1 & more\n# heading 🔥"
    const url = new URL(buildIssueUrl("suggestion", { title: "A & B #1", description: body }))
    expect(url.origin + url.pathname).toBe("https://github.com/MAUXII/copia/issues/new")
    expect(url.searchParams.get("template")).toBe("suggestion.yml")
    expect(url.searchParams.get("title")).toBe("A & B #1")
    expect(url.searchParams.get("description")).toBe(body)
  })
  it("truncates very long fields to stay under the URL limit", () => {
    const url = buildIssueUrl("suggestion", { title: "Long", description: "x".repeat(20000) })
    expect(url.length).toBeLessThanOrEqual(MAX_ISSUE_URL)
    expect(new URL(url).searchParams.get("description")!.endsWith("…")).toBe(true)
  })
})

describe("isValidPrUrl", () => {
  it("accepts a PR on the Copia repo", () => {
    expect(isValidPrUrl("https://github.com/MAUXII/copia/pull/12")).toBe(true)
  })
  it("rejects PRs on other repos and garbage", () => {
    expect(isValidPrUrl("https://github.com/other/repo/pull/1")).toBe(false)
    expect(isValidPrUrl("not a url")).toBe(false)
  })
})

describe("buildPrompt", () => {
  it("names the registry item and includes the demo source", () => {
    const prompt = buildPrompt(meta, "https://copia.dev/r/magnetic-button.json", "<MagneticButton>Hover me</MagneticButton>")
    expect(prompt).toContain("@copia/magnetic-button")
    expect(prompt).toContain("https://copia.dev/r/magnetic-button.json")
    expect(prompt).toContain("<MagneticButton>Hover me</MagneticButton>")
  })
})
