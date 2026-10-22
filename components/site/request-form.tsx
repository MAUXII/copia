"use client"

import { ArrowUpRight } from "lucide-react"
import { useState } from "react"
import { buildIssueUrl } from "@/lib/issues"

const field = "w-full rounded-lg border bg-card px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-highlight"

/** "New request": opens a prefilled GitHub issue that shows up on /requests. */
export function RequestForm() {
  const [error, setError] = useState<string | null>(null)

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>
    if (!data.title?.trim()) return setError("Give the component a name.")
    const url = buildIssueUrl("suggestion", { title: `[Request] ${data.title.trim()}`, name: data.title.trim(), description: data.description ?? "", reference: data.reference ?? "" })
    setError(null)
    window.open(url, "_blank", "noopener")
  }

  return (
    <form onSubmit={submit} onInput={() => setError(null)} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        Component name
        <input name="title" className={field} placeholder="Elastic slider" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        What does it do?
        <textarea name="description" rows={3} className={field} placeholder="A slider that stretches when you drag past the end…" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span>
          Where did you see it? <span className="text-muted-foreground">(link)</span>
        </span>
        <input name="reference" type="url" className={field} placeholder="https://…" />
      </label>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex flex-col gap-2">
        <button type="submit" className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-foreground px-4 text-sm font-medium whitespace-nowrap text-background">
          Request on GitHub
          <ArrowUpRight className="size-4" aria-hidden />
        </button>
        <span className="text-xs text-muted-foreground">Opens a prefilled issue. It shows up here within minutes.</span>
      </div>
    </form>
  )
}
