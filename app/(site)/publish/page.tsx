import type { Metadata } from "next"
import Link from "next/link"
import { CommandLine } from "@/components/site/copy-button"
import { CopyButton } from "@/components/site/copy-button"
import { REPO_URL } from "@/lib/site"

export const metadata: Metadata = {
  title: "Publish",
  description: "Publish a component on Copia: copy it with your agent, check it, open a pull request. It lands on your page at /@you.",
}

const AGENT_PROMPT = `Copy this component into Copia with the copy-component skill (.agents/skills/copy-component/SKILL.md): <paste the link>`

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-4 gap-y-3">
      <span className="font-mono text-sm text-[#ff7a45] tabular-nums">{String(n).padStart(2, "0")}</span>
      <h2 className="font-medium">{title}</h2>
      <div className="col-start-2 flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </li>
  )
}

const STATES = [
  ["In review", "Your pull request is open. The component and preview are checked by CI."],
  ["Published", "Merged: it is on the site and on your page at /@you."],
  ["Featured", "Picked for the home page."],
] as const

export default function PublishPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-32">
      <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">
        Publish<span className="font-serif font-light italic">.</span>
      </h1>
      <p className="mt-4 text-muted-foreground">
        Every component on Copia arrives as a pull request. Your agent does most of the work; you get the credit, a page at <span className="text-foreground">/@your-github</span>,
        and so does whoever made the original.
      </p>

      <ol className="mt-12 flex flex-col gap-10">
        <Step n={1} title="Fork and install">
          <p>
            Fork{" "}
            <a href={REPO_URL} className="text-foreground underline-offset-4 hover:underline">
              MAUXII/copia
            </a>
            , clone your fork, then install.
          </p>
          <CommandLine command="npm install" />
        </Step>
        <Step n={2} title="Copy it with your agent">
          <p>Open the repo in Claude Code, Codex or Cursor and paste this with the link to what you want to copy. The skill finds the best versions, rebuilds it as one file and adds a feature.</p>
          <div className="flex items-center gap-3 rounded-lg border bg-card py-2 pr-2 pl-4 font-mono text-xs">
            <span className="min-w-0 flex-1 truncate">{AGENT_PROMPT}</span>
            <CopyButton value={AGENT_PROMPT} label="Copy the prompt" />
          </div>
          <p>Building by hand instead? Scaffold the folder and follow the same skill.</p>
          <CommandLine command="npm run new my-component effects" />
        </Step>
        <Step n={3} title="Record the preview and check">
          <CommandLine command="npm run preview my-component" />
          <CommandLine command="npm run check && npm run lint" />
        </Step>
        <Step n={4} title="Open the pull request">
          <p>
            Push and open a pull request to <span className="text-foreground">main</span>. If it fulfils a{" "}
            <Link href="/requests" className="text-foreground underline-offset-4 hover:underline">
              request
            </Link>
            , write &quot;Closes #number&quot; so the request is marked built.
          </p>
        </Step>
      </ol>

      <section className="mt-16">
        <h2 className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">What happens next</h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-3">
          {STATES.map(([state, text], i) => (
            <li key={state} className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">
                <span className="mr-1.5 font-mono text-xs text-muted-foreground">{i + 1}</span>
                {state}
              </span>
              <span className="text-sm text-muted-foreground">{text}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16">
        <h2 className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">The rules</h2>
        <ul className="mt-5 flex flex-col gap-2 text-sm text-muted-foreground">
          <li>— Credit is mandatory: whoever made the original goes in meta.json, and gets a page too.</li>
          <li>— One file per component, and at least one feature beyond the reference.</li>
          <li>— You are the author of what you send; only you change its code, maintainers may edit its details.</li>
          <li>— A real preview: 1280×800, 3–8 seconds, no audio.</li>
        </ul>
      </section>

      <p className="mt-16 text-sm text-muted-foreground">
        Coming next: a Creator Studio. Sign in with GitHub, paste your component, and the site opens the pull request for you.
      </p>
    </div>
  )
}
