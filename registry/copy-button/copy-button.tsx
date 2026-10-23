"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Check, Copy } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export type CopyButtonProps = {
  /** Text written to the clipboard. */
  value: string
  label?: string
  copiedLabel?: string
  /** How long the copied state stays, in ms. */
  timeout?: number
  /** Show the copied state without copying (controlled). */
  copied?: boolean
  onCopy?: (value: string) => void
  /** Colour of the check. */
  successColor?: string
  className?: string
}

const MORPH = { type: "spring", bounce: 0.25, duration: 0.4 } as const
const SWAP = {
  initial: { opacity: 0, scale: 0.6, filter: "blur(4px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.6, filter: "blur(4px)" },
}

/**
 * A copy button whose icon morphs into a check and whose label swaps to
 * "Copied" while the button resizes to fit, then morphs back. The change is
 * announced to screen readers.
 */
export function CopyButton({ value, label = "Copy", copiedLabel = "Copied", timeout = 1600, copied, onCopy, successColor = "#30d158", className }: CopyButtonProps) {
  const [done, setDone] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const reduced = useReducedMotion()
  const shown = copied ?? done
  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      return
    }
    onCopy?.(value)
    setDone(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setDone(false), timeout)
  }

  const transition = reduced ? { duration: 0 } : MORPH
  return (
    <motion.button
      type="button"
      layout
      transition={transition}
      onClick={copy}
      className={cn(
        "inline-flex h-10 items-center gap-2 overflow-hidden rounded-full bg-foreground px-4 text-sm font-medium text-background outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]",
        className,
      )}
    >
      <span className="relative grid size-4 place-items-center">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span key={shown ? "check" : "copy"} {...SWAP} transition={transition} className="grid" style={{ color: shown ? successColor : undefined }}>
            {shown ? <Check className="size-4" strokeWidth={2.75} /> : <Copy className="size-4" />}
          </motion.span>
        </AnimatePresence>
      </span>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span key={shown ? "copied" : "copy"} layout="position" {...SWAP} transition={transition} className="whitespace-nowrap">
          {shown ? copiedLabel : label}
        </motion.span>
      </AnimatePresence>
      <span className="sr-only" aria-live="polite">
        {shown ? copiedLabel : ""}
      </span>
    </motion.button>
  )
}
