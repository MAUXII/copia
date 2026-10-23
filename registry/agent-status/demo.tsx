"use client"

import { useEffect, useState } from "react"
import { AgentStatus, type AgentStatusProps } from "./agent-status"

const STEPS = [
  { label: "Thinking…" },
  { label: "Searching the web…", detail: "spring physics UI motion" },
  { label: "Reading 3 sources…", detail: "emilkowal.ski, rauno.me, apple.com" },
  { label: "Writing the answer…" },
]

/** A run that loops: four steps, done, then again; open the steps to follow along. */
export default function Demo({ doneColor = "#30d158" }: Pick<AgentStatusProps, "doneColor">) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = setInterval(() => setCurrent((c) => (c + 1) % (STEPS.length + 2)), 1100)
    return () => clearInterval(id)
  }, [])

  const done = current >= STEPS.length
  return (
    <div className="grid flex-1 place-items-center p-6">
      <div className="flex w-full max-w-sm flex-col gap-3 rounded-2xl bg-muted/40 p-4">
        <p className="text-sm">How do I make UI feel physical?</p>
        <AgentStatus steps={STEPS} current={Math.min(current, STEPS.length - 1)} done={done} duration={4.2} doneColor={doneColor} />
      </div>
    </div>
  )
}
