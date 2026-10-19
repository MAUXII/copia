"use client"

import { RotateCcw } from "lucide-react"
import { useState } from "react"

/** Renders the demo and remounts it on "replay" so entrance animations run again. */
export function LiveDemo({ children }: { children: React.ReactNode }) {
  const [run, setRun] = useState(0)
  return (
    <div className="dark relative grid min-h-[420px] place-items-center overflow-hidden rounded-2xl border bg-[#0b0b0c] p-8 text-neutral-50">
      <div key={run}>{children}</div>
      <button
        type="button"
        onClick={() => setRun((n) => n + 1)}
        className="absolute top-3 right-3 inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 px-2.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50"
      >
        <RotateCcw className="size-3.5" aria-hidden />
        Replay
      </button>
    </div>
  )
}
