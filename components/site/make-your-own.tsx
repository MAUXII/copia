"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"
import { buildAgentPrompt } from "@/lib/agent-prompt"

/** "Make your own": describe a component, copy a prompt that hands it to the agent's skill. */
export function MakeYourOwn({ skill, title }: { skill: string; title: string }) {
  const [idea, setIdea] = useState("")
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(buildAgentPrompt({ skill, title }, idea))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void copy()
      }}
      className="flex items-center gap-2 rounded-2xl bg-muted/60 p-1.5 pl-4 ring-1 ring-border focus-within:ring-foreground/30"
    >
      <input
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        placeholder="a kitchen timer with minute buttons…"
        aria-label="What should the agent make?"
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
      <button type="submit" className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-foreground px-3.5 text-sm font-medium text-background transition-transform active:scale-[0.97]">
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? "Copied" : "Copy prompt"}
      </button>
    </form>
  )
}
