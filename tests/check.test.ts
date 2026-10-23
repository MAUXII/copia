import { beforeAll, afterAll, describe, expect, it } from "vitest"
import { execFileSync } from "node:child_process"
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, renameSync, unlinkSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { checkAll, checkComponent, type Problem } from "@/lib/check"

const FIXTURE = "tests/fixtures/registry/ok-button"
let work: string
let previews: string

function ffmpeg(args: string[]) {
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args])
}

/** A dark and a light take, as every component needs. */
function makePreviews(dir: string, slug: string, size = "1280x800", seconds = 5) {
  for (const name of [slug, `${slug}-light`]) {
    ffmpeg(["-f", "lavfi", "-i", `testsrc=size=${size}:rate=30:duration=${seconds}`, "-pix_fmt", "yuv420p", path.join(dir, `${name}.mp4`)])
    ffmpeg(["-f", "lavfi", "-i", `testsrc=size=${size}:rate=1:duration=1`, "-frames:v", "1", path.join(dir, `${name}.webp`)])
  }
}

/** Copies the ok-button fixture into a fresh registry root and lets the test mutate it. */
function setup(name: string, mutate?: (dir: string) => void) {
  const root = path.join(work, name)
  const dir = path.join(root, "ok-button")
  cpSync(FIXTURE, dir, { recursive: true })
  mutate?.(dir)
  return { root, dir }
}

function editMeta(dir: string, change: (meta: Record<string, unknown>) => void) {
  const file = path.join(dir, "meta.json")
  const meta = JSON.parse(readFileSync(file, "utf8"))
  change(meta)
  writeFileSync(file, JSON.stringify(meta))
}

function rules(problems: Problem[]) {
  return problems.map((p) => p.rule).join("\n")
}

beforeAll(() => {
  work = mkdtempSync(path.join(tmpdir(), "copia-check-"))
  previews = path.join(work, "previews")
  mkdirSync(previews)
  makePreviews(previews, "ok-button")
})
afterAll(() => rmSync(work, { recursive: true, force: true }))

describe("checkComponent", () => {
  it("passes a valid component", () => {
    const { dir } = setup("valid")
    expect(checkComponent(dir, previews)).toEqual([])
  })

  it("rejects a hard-coded colour class in the component", () => {
    const { dir } = setup("color", (d) => {
      const file = path.join(d, "ok-button.tsx")
      writeFileSync(file, readFileSync(file, "utf8").replace('"rounded-md px-4 py-2"', '"rounded-md bg-[#ff4d1c] px-4 py-2"'))
    })
    expect(rules(checkComponent(dir, previews))).toMatch(/hard-coded colour class bg-\[#ff4d1c\]/)
  })

  it("accepts a color control and rejects a non-hex default", () => {
    const ok = setup("color-control", (d) => editMeta(d, (m) => (m.controls = [{ prop: "accent", type: "color", default: "#2b7fff" }])))
    expect(checkComponent(ok.dir, previews)).toEqual([])
    const bad = setup("color-control-bad", (d) => editMeta(d, (m) => (m.controls = [{ prop: "accent", type: "color", default: "blue" }])))
    expect(rules(checkComponent(bad.dir, previews))).toMatch(/#rrggbb/)
  })

  it("rejects extra files", () => {
    const { dir } = setup("extra", (d) => writeFileSync(path.join(d, "utils.ts"), "export {}"))
    expect(rules(checkComponent(dir, previews))).toMatch(/only ok-button\.tsx, demo\.tsx, meta\.json allowed/)
  })

  it("rejects folder name different from meta.slug", () => {
    const { dir } = setup("mismatch", (d) => editMeta(d, (m) => (m.slug = "other-button")))
    expect(rules(checkComponent(dir, previews))).toMatch(/folder name must match meta\.slug/)
  })

  it("rejects an invalid slug", () => {
    const { root } = setup("badslug")
    const bad = path.join(root, "Bad Slug")
    renameSync(path.join(root, "ok-button"), bad)
    expect(rules(checkComponent(bad, previews))).toMatch(/kebab-case/)
  })

  it("rejects missing inspiration", () => {
    const { dir } = setup("noinsp", (d) => editMeta(d, (m) => delete m.inspiration))
    expect(rules(checkComponent(dir, previews))).toMatch(/inspiration/)
  })

  for (const spec of ["framer-motion", "../other/x", "lodash/debounce"]) {
    it(`rejects import of ${spec}`, () => {
      const { dir } = setup(`imp-${spec.replace(/\W/g, "")}`, (d) => {
        const file = path.join(d, "ok-button.tsx")
        writeFileSync(file, `import x from "${spec}"\n` + readFileSync(file, "utf8"))
      })
      expect(rules(checkComponent(dir, previews))).toMatch(new RegExp(`import "${spec.replace(/[./]/g, "\$&")}" is not allowed`))
    })
  }

  it("rejects require() of a forbidden module", () => {
    const { dir } = setup("req", (d) => {
      const file = path.join(d, "ok-button.tsx")
      writeFileSync(file, `const x = require("lodash")\n` + readFileSync(file, "utf8"))
    })
    expect(rules(checkComponent(dir, previews))).toMatch(/import "lodash" is not allowed/)
  })

  it("rejects a template-literal dynamic import", () => {
    const { dir } = setup("tpl", (d) => {
      const file = path.join(d, "ok-button.tsx")
      writeFileSync(file, "const m = import(`../other/x`)\n" + readFileSync(file, "utf8"))
    })
    expect(rules(checkComponent(dir, previews))).toMatch(/import "\.\.\/other\/x" is not allowed/)
  })

  it("ignores OS junk files like .DS_Store and Thumbs.db", () => {
    const { dir } = setup("junk", (d) => {
      writeFileSync(path.join(d, ".DS_Store"), "")
      writeFileSync(path.join(d, "Thumbs.db"), "")
    })
    expect(checkComponent(dir, previews)).toEqual([])
  })

  it("rejects a used package missing from meta.dependencies", () => {
    const { dir } = setup("deps", (d) => {
      const file = path.join(d, "ok-button.tsx")
      writeFileSync(file, `import { motion } from "motion/react"\n` + readFileSync(file, "utf8"))
    })
    expect(rules(checkComponent(dir, previews))).toMatch(/"motion" must be listed in meta\.dependencies/)
  })

  it("rejects a missing webp", () => {
    const own = path.join(work, "prev-missing")
    mkdirSync(own)
    makePreviews(own, "ok-button")
    unlinkSync(path.join(own, "ok-button.webp"))
    const { dir } = setup("nowebp")
    expect(rules(checkComponent(dir, own))).toMatch(/ok-button\.webp is missing/)
  })

  it("rejects a missing light preview", () => {
    const own = path.join(work, "prev-nolight")
    mkdirSync(own)
    makePreviews(own, "ok-button")
    unlinkSync(path.join(own, "ok-button-light.mp4"))
    const { dir } = setup("nolight")
    expect(rules(checkComponent(dir, own))).toMatch(/ok-button-light\.mp4 is missing/)
  })

  it("rejects a wrong-size mp4", () => {
    const own = path.join(work, "prev-small")
    mkdirSync(own)
    makePreviews(own, "ok-button", "640x400")
    const { dir } = setup("small")
    expect(rules(checkComponent(dir, own))).toMatch(/1280x800/)
  })

  it("rejects a too-long mp4", () => {
    const own = path.join(work, "prev-long")
    mkdirSync(own)
    makePreviews(own, "ok-button", "1280x800", 10)
    const { dir } = setup("long")
    expect(rules(checkComponent(dir, own))).toMatch(/3–8 s/)
  })
})

describe("demo assets", () => {
  it("requires every file in the demo assets folder to be credited in meta.assets", () => {
    const { dir } = setup("assets-missing")
    const assets = path.join(work, "assets-missing-demo")
    mkdirSync(assets)
    writeFileSync(path.join(assets, "photo.webp"), "x")
    expect(rules(checkComponent(dir, previews, assets))).toMatch(/photo\.webp is not credited in meta\.assets/)
  })

  it("passes when every demo asset is credited", () => {
    const { dir } = setup("assets-ok", (d) =>
      editMeta(d, (m) => (m.assets = [{ file: "photo.webp", author: "Someone", source: "https://example.com/photo", license: "Lummi" }])),
    )
    const assets = path.join(work, "assets-ok-demo")
    mkdirSync(assets)
    writeFileSync(path.join(assets, "photo.webp"), "x")
    expect(checkComponent(dir, previews, assets)).toEqual([])
  })
})

describe("checkAll", () => {
  it("rejects duplicate slugs across folders", () => {
    const { root } = setup("dupe")
    cpSync(path.join(root, "ok-button"), path.join(root, "ok-button-2"), { recursive: true })
    expect(rules(checkAll(root, previews))).toMatch(/duplicate slug "ok-button"/)
  })
})
