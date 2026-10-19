"use client"

import Link from "next/link"
import { Code2, Expand, Home, Info, Moon, PanelLeft, RotateCcw, Shrink, Sun } from "lucide-react"
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

function DockButton({ label, onClick, active, children }: { label: string; onClick: () => void; active?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "grid size-9 place-items-center rounded-xl text-neutral-300 transition-colors outline-none hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/40 [&_svg]:size-4",
        active && "bg-white/15 text-white",
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
    <div className="dark relative h-dvh overflow-hidden bg-[#070707] text-neutral-100">
      <div className="flex h-full">
        <AnimatePresence initial={false}>
          {panel && (
            <motion.aside
              key="panel"
              aria-label={`${name} details`}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "min(46vw, 640px)", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: PANEL_EASE }}
              className="h-full shrink-0 overflow-hidden max-md:absolute max-md:inset-0 max-md:z-30 max-md:!w-full max-md:bg-[#070707]"
            >
              <div className="h-full w-[min(46vw,640px)] overflow-y-auto px-8 pb-16 max-md:w-full max-md:px-5">
                {/* Fades content scrolling under the breadcrumb. */}
                <div aria-hidden className="pointer-events-none sticky top-0 z-10 -mx-8 h-24 bg-gradient-to-b from-[#070707] via-[#070707]/95 to-transparent max-md:-mx-5" />
                {info}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <motion.main
          layout
          transition={{ duration: 0.5, ease: PANEL_EASE }}
          className={cn("relative min-w-0 flex-1 overflow-hidden", panel && "my-3 mr-3 rounded-[28px] border border-white/10 max-md:hidden")}
        >
          <div className={cn("grid h-full place-items-center overflow-hidden p-6 transition-colors", light ? "bg-[#f2f2f0] text-neutral-900" : "bg-[#0b0b0c]")}>
            <div key={run} className={light ? "" : "dark"}>
              {preview}
            </div>
          </div>
        </motion.main>
      </div>

      {/* Breadcrumb */}
      <AnimatePresence>
        {!focus && (
          <motion.nav
            aria-label="Breadcrumb"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-5 left-5 z-40 flex items-center gap-3 text-[15px]"
          >
            <button type="button" aria-label={panel ? "Hide details" : "Show details"} onClick={() => openPanel(!panel)} className="glass grid size-9 place-items-center rounded-xl text-neutral-200 hover:text-white">
              <PanelLeft className="size-4" />
            </button>
            <span className={cn("flex items-center gap-2", light && !panel ? "text-neutral-500" : "text-neutral-400")}>
              <Link href="/#components" className="hover:text-white">
                Components
              </Link>
              <span aria-hidden>›</span>
              <span className={cn("font-medium", light && !panel ? "text-neutral-900" : "text-white")}>{name}</span>
            </span>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Dock */}
      <div className={cn("glass absolute top-4 right-4 z-40 flex items-center gap-0.5 rounded-2xl p-1 transition-opacity", focus && "opacity-40 hover:opacity-100")}>
        <Link href="/" aria-label="Home" title="Home" className="grid size-9 place-items-center rounded-xl text-neutral-300 hover:bg-white/10 hover:text-white">
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
            className={cn("pointer-events-none absolute top-16 right-24 z-30 hidden items-start gap-1 font-hand text-xl leading-tight md:flex", light ? "text-neutral-500" : "text-neutral-400")}
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
            className="absolute inset-x-0 bottom-5 z-30 flex justify-center px-4"
          >
            <InstallCommand target={installTarget} className="glass w-full max-w-xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
