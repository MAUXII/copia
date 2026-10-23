import type { Metadata } from "next"
import Link from "next/link"
import { getAgents } from "@/lib/agents"

export const metadata: Metadata = {
  title: "Agents",
  description: "Style agents: skills your coding agent installs to make components in one look, then check them in light and dark.",
}

export default function AgentsPage() {
  const agents = getAgents()
  return (
    <div className="mx-auto max-w-4xl px-4 pt-32">
      <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">
        Agents<span className="font-serif font-light italic">.</span>
      </h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        Style agents are skills for your coding agent. Install one, describe what you want, and it builds a component in that look, then checks it in light and dark and fixes what it
        sees.
      </p>
      <ul className="mt-12 grid gap-4 sm:grid-cols-2">
        {agents.map((agent) => (
          <li key={agent.slug}>
            <Link href={`/agents/${agent.slug}`} className="flex h-full flex-col gap-2 rounded-2xl bg-muted/50 p-5 transition-colors hover:bg-muted">
              <span className="flex items-center justify-between gap-3">
                <span className="text-lg font-medium">{agent.title}</span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {agent.examples.length} {agent.examples.length === 1 ? "example" : "examples"}
                </span>
              </span>
              <span className="text-sm text-muted-foreground">{agent.tagline}</span>
              <code className="mt-2 truncate font-mono text-xs text-muted-foreground">/{agent.skill}</code>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-sm text-muted-foreground">
        More looks are on the way. Have one?{" "}
        <Link href="/publish" className="text-foreground underline-offset-4 hover:underline">
          Publish an agent
        </Link>
        .
      </p>
    </div>
  )
}
