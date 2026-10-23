import { existsSync, readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { getComponents } from "./registry"
import type { Meta } from "./schema"
import { REPO } from "./site"

/** A style agent: a skill in .agents/skills/style-<slug> that makes components in one look. */
export type StyleAgent = {
  slug: string
  /** Folder name, also the skill name to install. */
  skill: string
  title: string
  tagline: string
  description: string
  examples: Meta[]
  install: string
}

const ROOT = ".agents/skills"

/** The few frontmatter fields the pages need (flat `key: value` and the `metadata:` block). */
function frontmatter(text: string) {
  const block = text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ""
  const fields: Record<string, string> = {}
  for (const line of block.split("\n")) {
    const m = line.match(/^\s*([a-z]+):\s*(.+)$/i)
    if (m) fields[m[1]] = m[2].trim().replace(/^["']|["']$/g, "")
  }
  return fields
}

export function getAgents(root = ROOT): StyleAgent[] {
  const base = path.join(process.cwd(), root)
  if (!existsSync(base)) return []
  const components = getComponents()
  return readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith("style-") && existsSync(path.join(base, d.name, "SKILL.md")))
    .map((d) => {
      const fm = frontmatter(readFileSync(path.join(base, d.name, "SKILL.md"), "utf8"))
      const slug = d.name.replace(/^style-/, "")
      return {
        slug,
        skill: d.name,
        title: fm.title ?? slug,
        tagline: fm.tagline ?? "",
        description: fm.description ?? "",
        examples: components.filter((m) => m.style === slug),
        install: `npx skills add ${REPO} --skill ${d.name}`,
      }
    })
    .sort((a, b) => b.examples.length - a.examples.length || a.title.localeCompare(b.title))
}

export function getAgent(slug: string, root?: string) {
  return getAgents(root).find((a) => a.slug === slug) ?? null
}
