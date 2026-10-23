import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowUpRight } from "lucide-react"
import { ComponentCard } from "@/components/site/component-card"
import { CommandLine } from "@/components/site/copy-button"
import { MakeYourOwn } from "@/components/site/make-your-own"
import { getAgent, getAgents } from "@/lib/agents"
import { REPO_URL } from "@/lib/site"

type Params = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return getAgents().map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const agent = getAgent((await params).slug)
  return agent ? { title: `${agent.title} agent`, description: agent.tagline } : {}
}

export default async function AgentPage({ params }: Params) {
  const agent = getAgent((await params).slug)
  if (!agent) notFound()
  return (
    <div className="mx-auto max-w-5xl px-4 pt-32">
      <Link href="/agents" className="text-sm text-muted-foreground hover:text-foreground">
        ← Agents
      </Link>
      <h1 className="mt-4 text-4xl font-medium tracking-tight sm:text-5xl">{agent.title}</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">{agent.tagline}</p>

      <section className="mt-10 grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h2 className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">1 · Install</h2>
          <CommandLine command={agent.install} className="w-full" />
          <a href={`${REPO_URL}/blob/main/.agents/skills/${agent.skill}/SKILL.md`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            Read the skill <ArrowUpRight className="size-3" />
          </a>
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">2 · Make your own</h2>
          <MakeYourOwn skill={agent.skill} title={agent.title} />
          <p className="text-xs text-muted-foreground">Copies a prompt for Claude Code, Codex or Cursor. Your agent builds it, looks at it in light and dark, and fixes it.</p>
        </div>
      </section>

      {agent.examples.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-5 font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">Made with {agent.title} · {agent.examples.length}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agent.examples.map((meta) => (
              <ComponentCard key={meta.slug} meta={meta} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
