import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { CATEGORIES, SLUG_RE } from "../schema"

const TEMPLATES = path.join(process.cwd(), "scripts", "templates")

function toPascal(slug: string) {
  return slug.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase())
}

function toTitle(slug: string) {
  return slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")
}

function localDate() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function createComponent(slug: string, root = "registry", options: { category?: string } = {}): void {
  const category = options.category ?? "effects"
  if (!(CATEGORIES as readonly string[]).includes(category)) {
    throw new Error(`Unknown category "${category}". Use one of: ${CATEGORIES.join(", ")}.`)
  }
  if (!SLUG_RE.test(slug)) {
    throw new Error(`"${slug}" is not a valid slug. Use kebab-case: lowercase letters, numbers and hyphens (e.g. magnetic-button).`)
  }
  const dir = path.join(root, slug)
  if (existsSync(dir)) {
    throw new Error(`registry/${slug} already exists. Pick another slug or edit the existing component.`)
  }
  const vars: Record<string, string> = {
    slug,
    Component: toPascal(slug),
    Name: toTitle(slug),
    date: localDate(),
    category,
  }
  const render = (file: string) =>
    readFileSync(path.join(TEMPLATES, file), "utf8").replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key])

  mkdirSync(dir, { recursive: true })
  writeFileSync(path.join(dir, `${slug}.tsx`), render("component.tsx.txt"))
  writeFileSync(path.join(dir, "demo.tsx"), render("demo.tsx.txt"))
  writeFileSync(path.join(dir, "meta.json"), render("meta.json.txt"))
}
