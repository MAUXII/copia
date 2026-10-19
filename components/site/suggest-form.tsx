"use client"

import { ArrowUpRight } from "lucide-react"
import { useState } from "react"
import { buildIssueUrl, isValidPrUrl } from "@/lib/issues"
import { cn } from "@/lib/utils"

type Mode = "idea" | "pr"

const field = "w-full rounded-lg border bg-card px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-highlight"

export function SuggestForm() {
  const [mode, setMode] = useState<Mode>("idea")
  const [error, setError] = useState<string | null>(null)

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>
    let url: string
    if (mode === "idea") {
      if (!data.title?.trim()) return setError("Give the component a name.")
      url = buildIssueUrl("suggestion", { title: `[Suggestion] ${data.title.trim()}`, name: data.title.trim(), description: data.description ?? "", reference: data.reference ?? "" })
    } else {
      if (!isValidPrUrl(data.pr_url ?? "")) return setError("Paste a link to a pull request on github.com/MAUXII/copia.")
      url = buildIssueUrl("pr-opened", { title: `[PR] ${data.pr_url.trim()}`, pr_url: data.pr_url.trim(), notes: data.notes ?? "" })
    }
    setError(null)
    window.open(url, "_blank", "noopener")
  }

  return (
    <div className="mt-10">
      <div className="mb-6 flex gap-5 text-sm" role="tablist">
        {(
          [
            ["idea", "I have an idea"],
            ["pr", "I opened a PR"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={mode === id}
            onClick={() => {
              setMode(id)
              setError(null)
            }}
            className={cn("transition-colors", mode === id ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            {label}
          </button>
        ))}
      </div>

      <form key={mode} onSubmit={submit} onInput={() => setError(null)} className="flex flex-col gap-4">
        {mode === "idea" ? (
          <>
            <label className="flex flex-col gap-1.5 text-sm">
              Component name
              <input name="title" className={field} placeholder="Elastic slider" />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              What does it do?
              <textarea name="description" rows={4} className={field} placeholder="A slider that stretches when you drag past the end…" />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              Where did you see it? <span className="text-muted-foreground">(optional)</span>
              <input name="reference" type="url" className={field} placeholder="https://…" />
            </label>
          </>
        ) : (
          <>
            <label className="flex flex-col gap-1.5 text-sm">
              Pull request link
              <input name="pr_url" className={field} placeholder="https://github.com/MAUXII/copia/pull/12" />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              Anything we should know? <span className="text-muted-foreground">(optional)</span>
              <textarea name="notes" rows={3} className={field} />
            </label>
          </>
        )}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-foreground whitespace-nowrap px-4 text-sm font-medium text-background">
            Continue on GitHub
            <ArrowUpRight className="size-4" aria-hidden />
          </button>
          <span className="text-xs text-muted-foreground">Opens a prefilled issue. A GitHub account is needed.</span>
        </div>
      </form>
    </div>
  )
}
