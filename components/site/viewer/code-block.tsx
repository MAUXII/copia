"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { CopyButton } from "../copy-button"

/** Code with a copy button; long code starts collapsed. */
export function CodeBlock({ code, label, collapsible = false }: { code: string; label: string; collapsible?: boolean }) {
  const [open, setOpen] = useState(!collapsible)
  return (
    <div className="relative overflow-hidden rounded-xl bg-white/[0.04]">
      <div className="flex items-center justify-between py-1 pr-1 pl-3 text-xs text-neutral-500">
        <span className="font-mono">{label}</span>
        <CopyButton value={code} label={`Copy ${label}`} className="text-neutral-400 hover:bg-white/10 hover:text-white" />
      </div>
      <pre className={cn("overflow-auto p-3 font-mono text-[12.5px] leading-relaxed text-neutral-300", !open && "max-h-56")}>
        <code>{code}</code>
      </pre>
      {collapsible && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn("w-full py-2 text-xs text-neutral-400 hover:text-white", !open && "absolute bottom-0 bg-gradient-to-t from-neutral-950 via-neutral-950/90 to-transparent pt-8")}
        >
          {open ? "Collapse" : "Expand code"}
        </button>
      )}
    </div>
  )
}
