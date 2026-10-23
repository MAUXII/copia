import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import type { Metadata } from "next"
import { ArrowUpRight } from "lucide-react"
import { getComponents } from "@/lib/registry"
import { REPO_URL } from "@/lib/site"

export const metadata: Metadata = {
  title: "Guides",
  description: "How Copia copies and crafts components, the techniques behind the effects, and a write-up for every component.",
}

const BLOB = `${REPO_URL}/blob/main`

const START = [
  { title: "How Copia copies", hint: "The skill your agent follows to recreate anything", href: `${BLOB}/.agents/skills/copy-component/SKILL.md` },
  { title: "How Copia crafts", hint: "Copia's style and feel rules for its own pieces", href: `${BLOB}/.agents/skills/craft-component/SKILL.md` },
  { title: "Agent guide", hint: "AGENTS.md: rules, commands, definition of done", href: `${BLOB}/AGENTS.md` },
  { title: "Previews", hint: "Recording the light and dark loops", href: `${BLOB}/docs/previews.md` },
]

/** GitHub's anchor for a markdown heading. */
const anchor = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")

function techniques() {
  const file = ".agents/skills/copy-component/references/techniques.md"
  const text = readFileSync(path.join(process.cwd(), file), "utf8")
  return [...text.matchAll(/^## (.+)$/gm)]
    .map((m) => m[1].trim())
    .filter((t) => !t.startsWith("<") && !/^(Template|Recording tip)/.test(t))
    .map((title) => ({ title, href: `${BLOB}/${file}#${anchor(title)}` }))
}

function caseStudies() {
  const names = new Map(getComponents().map((m) => [m.slug, m.name]))
  return readdirSync(path.join(process.cwd(), "knowledge/case-studies"))
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""))
    .map((slug) => ({ title: names.get(slug) ?? slug, href: `${BLOB}/knowledge/case-studies/${slug}.md` }))
    .sort((a, b) => a.title.localeCompare(b.title))
}

function Row({ title, hint, href }: { title: string; hint?: string; href: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="group flex h-12 items-center justify-between gap-4 border-b border-border text-sm last:border-0">
      <span className="flex min-w-0 items-baseline gap-3">
        <span className="shrink-0 font-medium">{title}</span>
        {hint && <span className="truncate text-muted-foreground">{hint}</span>}
      </span>
      <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" aria-hidden />
    </a>
  )
}

function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="mb-2 font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
        {title}
        {count !== undefined && ` · ${count}`}
      </h2>
      <div className="flex flex-col">{children}</div>
    </section>
  )
}

export default function GuidesPage() {
  const tech = techniques()
  const studies = caseStudies()
  return (
    <div className="mx-auto max-w-2xl px-4 pt-32">
      <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">
        Guides<span className="font-serif font-light italic">.</span>
      </h1>
      <p className="mt-4 text-muted-foreground">How every piece here was made: the workflow, the techniques with their numbers, and a write-up per component.</p>
      <Section title="Start here">
        {START.map((g) => (
          <Row key={g.title} {...g} />
        ))}
      </Section>
      <Section title="Techniques" count={tech.length}>
        {tech.map((t) => (
          <Row key={t.title} {...t} />
        ))}
      </Section>
      <Section title="Case studies" count={studies.length}>
        {studies.map((c) => (
          <Row key={c.href} {...c} />
        ))}
      </Section>
    </div>
  )
}
