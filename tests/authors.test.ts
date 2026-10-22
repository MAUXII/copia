import { describe, expect, it } from "vitest"
import { AuthorSchema, MetaSchema } from "@/lib/schema"
import { avatarUrl, claimUrl, getPeople } from "@/lib/authors"
import { readFileSync } from "node:fs"

const okMeta = JSON.parse(readFileSync("tests/fixtures/registry/ok-button/meta.json", "utf8"))

describe("author handles", () => {
  it("accepts a handle on the inspiration and on credits", () => {
    const meta = { ...okMeta, inspiration: { ...okMeta.inspiration, handle: "skiper-ui" }, credits: [{ author: "Emil", url: "https://emilkowal.ski", handle: "emilkowalski" }] }
    expect(MetaSchema.safeParse(meta).success).toBe(true)
  })
  it("rejects an uppercase handle", () => {
    expect(MetaSchema.safeParse({ ...okMeta, inspiration: { ...okMeta.inspiration, handle: "Skiper" } }).success).toBe(false)
  })
  it("validates author files", () => {
    expect(AuthorSchema.safeParse({ handle: "jane", name: "Jane", claimed: false }).success).toBe(true)
    expect(AuthorSchema.safeParse({ handle: "jane", name: "Jane" }).success).toBe(false)
  })
})

describe("people", () => {
  it("indexes the maker of every fixture component, without an authors file", () => {
    const people = getPeople("tests/fixtures/registry", "tests/fixtures/no-authors")
    const maker = people.find((p) => p.made.length > 0)
    expect(maker?.claimed).toBe(false)
    expect(maker?.since).toBe(Number(okMeta.createdAt.slice(0, 4)))
  })
  it("every real author file is valid and matches its credits", () => {
    const people = getPeople()
    expect(people.find((p) => p.handle === "mauxii")?.claimed).toBe(true)
    expect(people.every((p) => p.made.length + p.inspired.length + p.requested.length > 0)).toBe(true)
  })
  it("prefers the GitHub avatar and builds a claim link that opens a pull request", () => {
    expect(avatarUrl({ handle: "jane", name: "Jane", github: "jane", claimed: false })).toBe("https://github.com/jane.png?size=160")
    expect(avatarUrl({ handle: "acme", name: "Acme", claimed: false })).toBeNull()
    const url = claimUrl({ handle: "jane", name: "Jane", claimed: false }, false)
    expect(url).toContain("/new/main/authors?filename=jane.json")
    expect(decodeURIComponent(url)).toContain('"claimed": true')
    expect(claimUrl({ handle: "jane", name: "Jane", claimed: false }, true)).toContain("/edit/main/authors/jane.json")
  })
})
