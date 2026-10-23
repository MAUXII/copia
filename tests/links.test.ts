import { describe, expect, it } from "vitest"
import { buildIssueUrl, isValidPrUrl, MAX_ISSUE_URL } from "@/lib/issues"
import { buildPrompt, buildRequestPrompt } from "@/lib/prompt"
import { sortRequests, toRequest } from "@/lib/requests"
import type { Meta } from "@/lib/schema"

const meta: Meta = {
  slug: "magnetic-button",
  name: "Magnetic Button",
  description: "Pulled toward the cursor.",
  category: "buttons",
  collection: "copies",
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

describe("requests", () => {
  const issue = {
    number: 7,
    title: "[Request] Elastic slider",
    html_url: "https://github.com/MAUXII/copia/issues/7",
    state: "open",
    created_at: "2026-10-20T10:00:00Z",
    user: { login: "Jane" },
    reactions: { "+1": 3 },
    body: "### Component name\n\nElastic slider\n\n### What does it do?\n\nStretches past the end.\n\n### Where did you see it?\n\nhttps://example.com/slider",
  }
  it("reads the issue form answers and votes", () => {
    const request = toRequest(issue)
    expect(request).toMatchObject({ number: 7, title: "Elastic slider", votes: 3, done: false, by: "Jane", reference: "https://example.com/slider", description: "Stretches past the end." })
  })
  it("ignores empty answers and non-links", () => {
    const request = toRequest({ ...issue, body: "### Component name\n\nX\n\n### What does it do?\n\n_No response_\n\n### Where did you see it?\n\nsomewhere" })
    expect(request.description).toBeNull()
    expect(request.reference).toBeNull()
  })
  it("ranks open requests by votes and puts built ones last", () => {
    const a = { ...toRequest(issue), number: 1, votes: 1 }
    const b = { ...toRequest(issue), number: 2, votes: 5 }
    const c = { ...toRequest(issue), number: 3, votes: 9, done: true }
    expect(sortRequests([a, c, b]).map((r) => r.number)).toEqual([2, 1, 3])
  })
  it("hands the request to an agent with the meta.json link and Closes", () => {
    const prompt = buildRequestPrompt(toRequest(issue))
    expect(prompt).toContain('"request": { "issue": 7, "by": "jane" }')
    expect(prompt).toContain("Closes #7")
    expect(prompt).toContain("https://example.com/slider")
  })
})
