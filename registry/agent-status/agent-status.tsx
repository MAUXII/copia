"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Check, ChevronDown } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export type AgentStep = { label: string; detail?: string }

export type AgentStatusProps = {
  steps: AgentStep[]
  /** Index of the step running now. Past steps are done. */
  current: number
  /** All steps finished. */
  done?: boolean
  /** Seconds the run took, shown once done. */
  duration?: number
  /** Colour of the finished check. */
  doneColor?: string
  className?: string
}

const SWAP = { type: "spring", bounce: 0.2, duration: 0.45 } as const
const LINE = {
  initial: { opacity: 0, y: 8, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -8, filter: "blur(4px)" },
}

/** A small spinner drawn as an arc, so it reads at 14px. */
function Spinner() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5 animate-spin text-muted-foreground motion-reduce:animate-none" aria-hidden>
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/**
 * What an agent is doing, in one calm line: the running step shimmers, steps
 * replace each other by sliding up with a blur, and the line settles into
 * "Done in 4.2s" with a check. Click it to open the steps it went through.
 */
export function AgentStatus({ steps, current, done = false, duration, doneColor = "#30d158", className }: AgentStatusProps) {
  const [open, setOpen] = useState(false)
  const reduced = useReducedMotion()
  const step = steps[Math.min(current, steps.length - 1)]
  const headline = done ? (duration !== undefined ? `Done in ${duration.toFixed(1)}s` : "Done") : step?.label
  const transition = reduced ? { duration: 0 } : SWAP

  return (
    <div className={cn("flex w-full max-w-sm flex-col text-sm", className)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 items-center gap-2.5 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="grid size-4 shrink-0 place-items-center">
          <AnimatePresence initial={false} mode="popLayout">
            {done ? (
              <motion.span key="done" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={transition} style={{ color: doneColor }}>
                <Check className="size-4" strokeWidth={2.75} />
              </motion.span>
            ) : (
              <motion.span key="run" exit={{ scale: 0.4, opacity: 0 }} transition={transition}>
                <Spinner />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        <span className="relative h-5 min-w-0 flex-1 overflow-hidden">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={headline}
              {...LINE}
              transition={transition}
              className={cn(
                "block truncate",
                done
                  ? "text-muted-foreground"
                  : // The running step shimmers: a light band sweeping across the text.
                    "animate-[agent-shimmer_1.6s_linear_infinite] bg-[linear-gradient(90deg,var(--muted-foreground)_0%,var(--muted-foreground)_40%,var(--foreground)_50%,var(--muted-foreground)_60%,var(--muted-foreground)_100%)] bg-[length:250%_100%] bg-clip-text text-transparent motion-reduce:animate-none",
              )}
            >
              {headline}
            </motion.span>
          </AnimatePresence>
        </span>
        <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-300", open && "rotate-180")} aria-hidden />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.ol
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={transition}
            className="overflow-hidden"
          >
            {steps.map((s, i) => {
              const state = done || i < current ? "done" : i === current ? "running" : "waiting"
              return (
                <li key={s.label} className="flex items-start gap-2.5 py-1.5 pl-[3px]">
                  <span className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", state === "waiting" ? "bg-muted" : state === "running" ? "bg-foreground" : "bg-muted-foreground/60")} />
                  <span className="flex min-w-0 flex-col">
                    <span className={cn(state === "waiting" ? "text-muted-foreground/60" : state === "running" ? "text-foreground" : "text-muted-foreground")}>{s.label}</span>
                    {s.detail && <span className="truncate text-xs text-muted-foreground">{s.detail}</span>}
                  </span>
                </li>
              )
            })}
          </motion.ol>
        )}
      </AnimatePresence>

      <span className="sr-only" aria-live="polite">
        {headline}
      </span>
      <style>{"@keyframes agent-shimmer { from { background-position: 100% 0 } to { background-position: -150% 0 } }"}</style>
    </div>
  )
}
