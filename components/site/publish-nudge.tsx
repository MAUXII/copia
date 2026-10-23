"use client"

import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { ArrowUpRight, X } from "lucide-react"
import { useEffect, useState } from "react"

const KEY = "copia:publish-nudge-closed"

/**
 * A small floating card in the bottom-right corner: "Want to publish yours?"
 * with links to Publish and Requests. It slides in after a moment and stays
 * closed once dismissed (remembered per browser).
 */
export function PublishNudge() {
  const [open, setOpen] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    let closed = false
    try {
      closed = localStorage.getItem(KEY) === "1"
    } catch {}
    if (closed) return
    const id = setTimeout(() => setOpen(true), 1200)
    return () => clearTimeout(id)
  }, [])

  const close = () => {
    setOpen(false)
    try {
      localStorage.setItem(KEY, "1")
    } catch {}
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          aria-label="Publish your component"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.97, filter: "blur(4px)" }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
          className="fixed right-4 bottom-4 z-40 w-[17rem] rounded-2xl bg-popover p-4 text-popover-foreground shadow-[0_8px_30px_rgb(0_0_0/0.18)] ring-1 ring-border"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute top-2.5 right-2.5 grid size-6 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
          <p className="pr-6 text-sm font-medium">Built something great?</p>
          <p className="mt-1 text-[13px] leading-snug text-muted-foreground">Publish it with credit, or ask for the one you want.</p>
          <div className="mt-3 flex items-center gap-2">
            <Link href="/publish" className="inline-flex h-8 items-center gap-1 rounded-full bg-foreground px-3.5 text-xs font-medium text-background transition-transform active:scale-[0.97]">
              How to publish
              <ArrowUpRight className="size-3.5" />
            </Link>
            <Link href="/requests" className="inline-flex h-8 items-center rounded-full px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              Request one
            </Link>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
