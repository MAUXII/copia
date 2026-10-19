"use client"

import { useEffect, useId, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

export type MenuLink = { label: string; href: string; meta?: string }

export type StaggeredMenuProps = {
  links: MenuLink[]
  /** Logo or brand shown on the left of the bar. */
  logo?: React.ReactNode
  /** Small links in the panel footer. */
  footer?: MenuLink[]
  /** Controlled open state. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Accent color for the big links. */
  accent?: string
  className?: string
}

const EASE = [0.22, 1, 0.36, 1] as const

/** Nike-style menu: a glass panel unfolds under the bar and the links cascade in. */
export function StaggeredMenu({ links, logo, footer = [], open, onOpenChange, accent = "#ff2a1f", className }: StaggeredMenuProps) {
  const [inner, setInner] = useState(false)
  const isOpen = open ?? inner
  const setOpen = (next: boolean) => (onOpenChange ? onOpenChange(next) : setInner(next))
  const reduceMotion = useReducedMotion()
  const panelId = useId()

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  return (
    <div className={cn("relative z-20 flex w-full flex-col gap-2", className)}>
      <div className="flex h-11 items-center justify-between rounded-xl bg-neutral-900/90 px-4 text-white backdrop-blur-md">
        {logo ?? <span className="text-sm font-black tracking-tight italic">COPIA</span>}
        <button type="button" aria-expanded={isOpen} aria-controls={panelId} onClick={() => setOpen(!isOpen)} className="relative h-5 overflow-hidden text-xs font-semibold tracking-wide">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={isOpen ? "close" : "menu"} className="block" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "-100%" }} transition={{ duration: 0.3, ease: EASE }}>
              {isOpen ? "CLOSE" : "MENU"}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.nav
            id={panelId}
            aria-label="Main"
            className="flex flex-col gap-2 overflow-hidden"
            initial={reduceMotion ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0 round 12px)" }}
            animate={reduceMotion ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0 round 12px)" }}
            exit={reduceMotion ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0 round 12px)", transition: { duration: 0.45, ease: EASE, delay: 0.1 } }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <ul className="flex flex-col items-center gap-0.5 rounded-xl bg-neutral-900/70 py-6 backdrop-blur-2xl">
              {links.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={reduceMotion ? false : { opacity: 0, y: 18, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: EASE, delay: 0.15 + i * 0.05 } }}
                  exit={{ opacity: 0, y: -10, filter: "blur(6px)", transition: { duration: 0.2, delay: (links.length - 1 - i) * 0.02 } }}
                >
                  <a href={link.href} className="group flex items-start gap-1 text-2xl leading-none font-black tracking-tight uppercase transition-opacity hover:opacity-70" style={{ color: accent }}>
                    {link.label}
                    {link.meta && <sup className="mt-0.5 text-[9px] font-semibold tracking-normal">{link.meta}</sup>}
                  </a>
                </motion.li>
              ))}
            </ul>
            {footer.length > 0 && (
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.35, duration: 0.4, ease: EASE } }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                className="flex justify-between rounded-xl bg-neutral-900/80 px-4 py-2.5 text-[11px] text-neutral-400 backdrop-blur-xl"
              >
                {footer.map((link) => (
                  <a key={link.href} href={link.href} className="hover:text-white">
                    {link.label}
                  </a>
                ))}
              </motion.div>
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  )
}
