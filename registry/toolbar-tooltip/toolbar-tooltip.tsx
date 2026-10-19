"use client"

import { useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

export type ToolbarItem = {
  /** Accessible name and tooltip text. */
  label: string
  icon: React.ReactNode
  /** Keys shown in the tooltip, e.g. ["⌘", "K"]. */
  shortcut?: string[]
  onClick?: () => void
}

export type ToolbarTooltipProps = {
  items: ToolbarItem[]
  /** Delay before the first tooltip appears (ms). Once one is open, others appear instantly. */
  delay?: number
  /** Show the tooltip above or below the toolbar. */
  side?: "top" | "bottom"
  className?: string
}

const SLIDE = { type: "spring", bounce: 0.15, duration: 0.35 } as const

/** A floating toolbar with one shared tooltip that glides between buttons. */
export function ToolbarTooltip({ items, delay = 350, side = "top", className }: ToolbarTooltipProps) {
  const [active, setActive] = useState<number | null>(null)
  const [center, setCenter] = useState(0)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const warm = useRef(false)
  const reduceMotion = useReducedMotion()

  const show = (index: number, el: HTMLElement) => {
    clearTimeout(timer.current)
    const open = () => {
      setCenter(el.offsetLeft + el.offsetWidth / 2)
      setActive(index)
      warm.current = true
    }
    if (warm.current) open()
    else timer.current = setTimeout(open, delay)
  }
  const hide = () => {
    clearTimeout(timer.current)
    setActive(null)
    // Stay "warm" briefly so moving back in does not wait for the delay again.
    timer.current = setTimeout(() => (warm.current = false), 300)
  }

  const item = active === null ? null : items[active]

  return (
    <div role="toolbar" onPointerLeave={hide} onBlur={hide} onKeyDown={(e) => e.key === "Escape" && hide()} className={cn("relative inline-flex items-center gap-0.5 rounded-full bg-neutral-950 p-1 text-neutral-400 shadow-lg ring-1 ring-white/10", className)}>
      {items.map((it, i) => (
        <button
          key={it.label}
          type="button"
          aria-label={it.label}
          aria-keyshortcuts={it.shortcut?.join("+")}
          onClick={it.onClick}
          onPointerEnter={(e) => show(i, e.currentTarget)}
          onFocus={(e) => show(i, e.currentTarget)}
          className={cn(
            "grid size-8 place-items-center rounded-full transition-colors outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-white/40 [&_svg]:size-4",
            active === i && "bg-white/10 text-white",
          )}
        >
          {it.icon}
        </button>
      ))}

      <AnimatePresence>
        {item && (
          <motion.div
            role="tooltip"
            initial={{ opacity: 0, x: center, y: side === "top" ? 4 : -4, scale: 0.96 }}
            animate={{ opacity: 1, x: center, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.12 } }}
            transition={reduceMotion ? { duration: 0 } : SLIDE}
            className={cn("pointer-events-none absolute left-0", side === "top" ? "bottom-full mb-2" : "top-full mt-2")}
          >
            <motion.div
              layout={!reduceMotion}
              transition={SLIDE}
              className="flex -translate-x-1/2 items-center gap-1.5 rounded-lg bg-neutral-950 py-1 pr-1 pl-2.5 text-xs whitespace-nowrap text-white ring-1 ring-white/10"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={item.label} initial={{ opacity: 0, filter: "blur(2px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(2px)" }} transition={{ duration: 0.15 }} className="flex items-center gap-1.5">
                  {item.label}
                  {item.shortcut?.map((key) => (
                    <kbd key={key} className="grid h-5 min-w-5 place-items-center rounded bg-white/10 px-1 font-sans text-[10px] text-neutral-300">
                      {key}
                    </kbd>
                  ))}
                  {!item.shortcut && <span className="w-1" />}
                </motion.span>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
