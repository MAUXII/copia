// @vitest-environment jsdom
import { describe, expect, it } from "vitest"
import { render } from "@testing-library/react"
import { filterComponents } from "@/lib/filter"
import { ComponentCard } from "@/components/site/component-card"
import type { Meta } from "@/lib/schema"

const base: Meta = {
  slug: "magnetic-button",
  name: "Magnetic Button",
  description: "Pulled toward the cursor.",
  category: "buttons",
  tags: ["hover", "cursor"],
  author: { name: "Copia", github: "MAUXII" },
  inspiration: { author: "Olivier Larose", url: "https://blog.olivierlarose.com/tutorials/magnetic-button" },
  dependencies: ["motion"],
  props: [],
  createdAt: "2026-10-13",
}
const items: Meta[] = [
  base,
  { ...base, slug: "scramble-text", name: "Scramble Text", category: "text", tags: ["typing", "efeito"] },
  { ...base, slug: "dock", name: "Dock", category: "navigation", tags: ["macOS"] },
]

describe("filterComponents", () => {
  it("returns everything for all + empty query", () => {
    expect(filterComponents(items, "all", "")).toHaveLength(3)
  })
  it("filters by category", () => {
    expect(filterComponents(items, "text", "").map((m) => m.slug)).toEqual(["scramble-text"])
  })
  it("matches name case-insensitively", () => {
    expect(filterComponents(items, "all", "MAGNETIC").map((m) => m.slug)).toEqual(["magnetic-button"])
  })
  it("matches tags", () => {
    expect(filterComponents(items, "all", "macos").map((m) => m.slug)).toEqual(["dock"])
  })
  it("ignores accents", () => {
    expect(filterComponents(items, "all", "éfeito").map((m) => m.slug)).toEqual(["scramble-text"])
  })
})

describe("ComponentCard", () => {
  it("renders a muted inline looping video with the webp poster", () => {
    const { container } = render(<ComponentCard meta={base} />)
    const video = container.querySelector("video")!
    expect(video).not.toBeNull()
    expect(video.muted).toBe(true)
    expect(video.hasAttribute("playsinline")).toBe(true)
    expect(video.loop).toBe(true)
    expect(video.getAttribute("preload")).toBe("none")
    expect(video.getAttribute("poster")).toBe("/previews/magnetic-button.webp")
    expect(container.querySelector("a")!.getAttribute("href")).toBe("/c/magnetic-button")
  })
})
