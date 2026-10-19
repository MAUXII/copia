"use client"

import Link from "next/link"
import { Code2, Expand, Home, Info, Moon, RotateCcw, Shrink, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "@/lib/utils"
import { InstallCommand } from "./install-command"

type Props = {
  name: string
  installTarget: string
  /** The live demo. */
  preview: React.ReactNode
  /** The specification panel content. */
  info: React.ReactNode
}

const PANEL_EASE = [0.22, 1, 0.36, 1] as const

/** Rounded square with the left pane highlighted: the sidebar toggle. */
function SidebarIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="currentColor" opacity={0.35} />
      <rect x="5" y="5" width="5.5" height="14" rx="2.5" fill="currentColor" opacity={open ? 1 : 0.9} />
    </svg>
  )
}

function DockButton({ label, onClick, active, children }: { label: string; onClick: () => void; active?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "grid size-8 place-items-center rounded-full bg-white/[0.06] text-neutral-300 transition-colors outline-none hover:bg-white/15 hover:text-white focus-visible:ring-2 focus-visible:ring-white/40 [&_svg]:size-4",
        active && "bg-white/20 text-white",
      )}
    >
      {children}
    </button>
  )
}

/** Full-screen component page: the demo fills the viewport, specs slide in from the left. */
export function ComponentViewer({ name, installTarget, preview, info }: Props) {
  const [panel, setPanel] = useState(false)
  const [focus, setFocus] = useState(false)
  const [light, setLight] = useState(false)
  const [run, setRun] = useState(0)
  const [hint, setHint] = useState(false)

  useEffect(() => {
    try {
      setHint(localStorage.getItem("copia:hint-seen") !== "1")
    } catch {
      setHint(true)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPanel(false)
        setFocus(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const openPanel = (next: boolean) => {
    setPanel(next)
    if (next) setFocus(false)
    if (hint) {
      setHint(false)
      try {
        localStorage.setItem("copia:hint-seen", "1")
      } catch {}
    }
  }

  return (
    <div className="dark flex h-dvh flex-col overflow-hidden bg-[#070707] text-neutral-100">
      {/* Top bar: breadcrumb on the page background, like Componentry. Hidden in full screen. */}
      {!focus && (
        <header className="flex h-14 shrink-0 items-center px-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2">
            <button
              type="button"
              aria-label={panel ? "Hide details" : "Show details"}
              aria-expanded={panel}
              onClick={() => openPanel(!panel)}
              className="grid size-8 place-items-center rounded text-white/50 transition-colors hover:text-white"
            >
              <SidebarIcon open={panel} />
            </button>
            <span className="flex items-center gap-2 text-[15px]">
              <Link href="/#components" className="text-white/45 transition-colors hover:text-white/80">
                Components
              </Link>
              <span aria-hidden className="text-white/45">
                ›
              </span>
              <span className="font-medium text-white/60">{name}</span>
            </span>
          </nav>
        </header>
      )}

      <div className="flex min-h-0 flex-1">
        <AnimatePresence initial={false}>
          {panel && (
            <motion.aside
              key="panel"
              aria-label={`${name} details`}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "min(46vw, 640px)", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: PANEL_EASE }}
              className="h-full shrink-0 overflow-hidden max-md:absolute max-md:inset-x-0 max-md:top-14 max-md:bottom-0 max-md:z-30 max-md:!w-full max-md:bg-[#070707]"
            >
              <div className="h-full w-[min(46vw,640px)] overflow-y-auto px-8 pt-6 pb-16 max-md:w-full max-md:px-5">{info}</div>
            </motion.aside>
          )}
        </AnimatePresence>

        <motion.main
          layout
          transition={{ duration: 0.5, ease: PANEL_EASE }}
          className={cn("relative min-w-0 flex-1 overflow-hidden", !focus && "mx-3 mb-3 rounded-2xl", panel && "max-md:hidden")}
        >
          {/* The demo owns the whole area; if it is taller, this area scrolls (never a box inside). */}
          <div
            data-copia-scroll
            className={cn("h-full overflow-x-hidden overflow-y-auto transition-colors", light ? "bg-[#f2f2f0] text-neutral-900" : "bg-[#0b0b0c]")}
          >
            <div key={run} className={cn("flex min-h-full w-full flex-col", !light && "dark")}>
              {preview}
            </div>
          </div>

          {/* Dock */}
          <div className={cn("absolute top-3 right-3 z-40 flex items-center gap-1 rounded-full bg-neutral-800/85 p-1 transition-opacity", focus && "opacity-40 hover:opacity-100")}>
            <Link href="/" aria-label="Home" title="Home" className="grid size-8 place-items-center rounded-full bg-white/[0.06] text-neutral-300 hover:bg-white/15 hover:text-white">
              <Home className="size-4" />
            </Link>
            <DockButton label="Replay" onClick={() => setRun((n) => n + 1)}>
              <RotateCcw />
            </DockButton>
            <DockButton label={focus ? "Exit full screen" : "Full screen preview"} onClick={() => { setFocus((f) => !f); setPanel(false) }} active={focus}>
              {focus ? <Shrink /> : <Expand />}
            </DockButton>
            <DockButton label="Code and details" onClick={() => openPanel(!panel)} active={panel}>
              {panel ? <Code2 /> : <Info />}
            </DockButton>
            <DockButton label={light ? "Dark preview" : "Light preview"} onClick={() => setLight((l) => !l)} active={light}>
              {light ? <Moon /> : <Sun />}
            </DockButton>
          </div>

          {/* Handwritten hint */}
          <AnimatePresence>
            {hint && !panel && !focus && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0, transition: { delay: 0.6 } }}
                exit={{ opacity: 0 }}
                className={cn("pointer-events-none absolute top-14 right-20 z-30 hidden items-start gap-1 font-hand text-xl leading-tight md:flex", light ? "text-neutral-500" : "text-neutral-400")}
              >
                <span className="mt-4 rotate-[-4deg] text-right">
                  Click here to see the code,
                  <br />
                  props and credits!
                </span>
                <svg width="54" height="46" viewBox="0 0 54 46" fill="none" className="-mt-1" aria-hidden>
                  <path d="M4 42 C 20 40, 38 30, 44 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M36 14 L44 6 L49 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Install pill */}
          <AnimatePresence>
            {!focus && !panel && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute inset-x-0 bottom-4 z-30 flex justify-center px-4"
              >
                <InstallCommand target={installTarget} className="w-full max-w-xl bg-neutral-900/95" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.main>
      </div>
    </div>
  )
}
