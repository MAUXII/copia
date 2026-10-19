import { existsSync, readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { MetaSchema, type Meta } from "./schema"

const DEFAULT_ROOT = "registry"

function resolveRoot(root: string) {
  return path.join(process.cwd(), root)
}

function readMeta(dir: string): Meta {
  const file = path.join(dir, "meta.json")
  const result = MetaSchema.safeParse(JSON.parse(readFileSync(file, "utf8")))
  if (!result.success) {
    throw new Error(`Invalid meta.json in ${path.basename(dir)}: ${result.error.message}`)
  }
  return result.data
}

export function getComponents(root = DEFAULT_ROOT): Meta[] {
  const base = resolveRoot(root)
  if (!existsSync(base)) return []
  return readdirSync(base, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(path.join(base, entry.name, "meta.json")))
    .map((entry) => readMeta(path.join(base, entry.name)))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.name.localeCompare(b.name))
}

export function getComponent(slug: string, root = DEFAULT_ROOT): Meta | null {
  return getComponents(root).find((meta) => meta.slug === slug) ?? null
}

export function readSource(slug: string, file: "component" | "demo", root = DEFAULT_ROOT): string {
  const name = file === "component" ? `${slug}.tsx` : "demo.tsx"
  return readFileSync(path.join(resolveRoot(root), slug, name), "utf8")
}
