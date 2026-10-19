"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { CopyButton } from "./copy-button"

export type CodeTab = { id: string; label: string; content: string; language?: string }

export function CodeTabs({ tabs }: { tabs: CodeTab[] }) {
  const [active, setActive] = useState(tabs[0].id)
  const current = tabs.find((tab) => tab.id === active) ?? tabs[0]
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="flex items-center gap-1 border-b px-2" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={tab.id === active}
            onClick={() => setActive(tab.id)}
            className={cn(
              "-mb-px border-b px-3 py-2.5 text-sm transition-colors",
              tab.id === active ? "border-highlight text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
        <CopyButton value={current.content} label={`Copy ${current.label.toLowerCase()}`} className="ml-auto" />
      </div>
      <pre className="max-h-[480px] overflow-auto p-4 font-mono text-[13px] leading-relaxed text-muted-foreground">
        <code>{current.content}</code>
      </pre>
    </div>
  )
}
