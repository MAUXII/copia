"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export type ReelProject = {
  title: string
  label: string
  image: string
  href?: string
}

export type HoverReelProps = {
  projects: ReelProject[]
  /** Frame width in px; the height follows at 10:16. */
  width?: number
  /** Text on the round badge riding the frame. Empty hides it. */
  cursorLabel?: string
  /** Degrees the frame leans into fast horizontal moves. 0 keeps it upright. */
  tilt?: number
  className?: string
}

// Dennis Snellenberg's work list: the frame scales in on this curve and the strip rolls on it too.
const EASE = "cubic-bezier(0.76, 0, 0.24, 1)"
const FOLLOW = 0.16 // share of the remaining distance the frame covers each frame
const INSET = 16 // px the frame keeps from the list's edges

/**
 * A list of projects. Point at a title and a picture blooms under the cursor
 * and follows it; move to another row and the pictures roll past inside the
 * frame instead of swapping. Touch screens show a small picture inline.
 */
export function HoverReel({ projects, width = 320, cursorLabel = "View", tilt = 6, className }: HoverReelProps) {
  const host = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(-1)
  const [open, setOpen] = useState(false)
  const height = Math.round((width * 10) / 16)

  // The frame chases the pointer with an eased lerp, leans into its speed, and sleeps when it arrives.
  useEffect(() => {
    const el = host.current
    const f = frame.current
    if (!el || !f) return
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches
    const s = { x: 0, y: 0, tx: 0, ty: 0, lean: 0, raf: 0, placed: false }
    const write = () => {
      f.style.translate = `${s.x}px ${s.y}px`
      f.style.rotate = `${s.lean}deg`
    }
    const tick = () => {
      s.raf = 0
      const k = reduced ? 1 : FOLLOW
      const dx = (s.tx - s.x) * k
      s.x += dx
      s.y += (s.ty - s.y) * k
      // Copia: lean toward the direction of travel, proportional to speed.
      s.lean = reduced ? 0 : Math.max(-tilt, Math.min(tilt, dx * 0.35))
      write()
      if (Math.abs(s.tx - s.x) + Math.abs(s.ty - s.y) > 0.3) s.raf = requestAnimationFrame(tick)
      else if (s.lean !== 0) {
        s.lean = 0
        write()
      }
    }
    const aim = (cx: number, cy: number) => {
      const r = el.getBoundingClientRect()
      const w = f.offsetWidth
      const h = f.offsetHeight
      s.tx = Math.max(INSET, Math.min(el.offsetWidth - w - INSET, cx - r.left - w / 2))
      s.ty = Math.max(INSET, Math.min(el.offsetHeight - h - INSET, cy - r.top - h / 2))
      if (!s.placed) {
        s.x = s.tx
        s.y = s.ty
        s.placed = true
        write()
      }
      if (!s.raf) s.raf = requestAnimationFrame(tick)
    }
    const onMove = (e: PointerEvent) => e.pointerType === "mouse" && aim(e.clientX, e.clientY)
    const onLeave = () => {
      s.placed = false
      setOpen(false)
    }
    // Keyboard focus parks the frame at the right of the focused row.
    const onFocus = (e: FocusEvent) => {
      const row = (e.target as HTMLElement).closest<HTMLElement>("[data-row]")
      if (!row || !row.matches(":focus-visible")) return
      const r = row.getBoundingClientRect()
      s.placed = false
      aim(r.right - f.offsetWidth / 2 - 24, r.top + r.height / 2)
    }
    el.addEventListener("pointermove", onMove)
    el.addEventListener("pointerleave", onLeave)
    el.addEventListener("focusin", onFocus)
    return () => {
      cancelAnimationFrame(s.raf)
      el.removeEventListener("pointermove", onMove)
      el.removeEventListener("pointerleave", onLeave)
      el.removeEventListener("focusin", onFocus)
    }
  }, [tilt])

  return (
    <div ref={host} className={cn("relative w-full", className)}>
      <ul className="border-t border-border" onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setOpen(false)}>
        {projects.map((p, i) => {
          const lit = open && active === i
          return (
            <li key={p.title} className="border-b border-border">
              <a
                data-row
                href={p.href ?? "#"}
                onPointerEnter={(e) => {
                  if (e.pointerType !== "mouse") return
                  setActive(i)
                  setOpen(true)
                }}
                onFocus={() => {
                  setActive(i)
                  setOpen(true)
                }}
                onClick={(e) => !p.href && e.preventDefault()}
                className="group flex items-center gap-4 py-7 outline-none focus-visible:ring-2 focus-visible:ring-ring sm:py-9"
              >
                {/* Touch screens have no hover: a small picture sits inline instead. */}
                {/* eslint-disable-next-line @next/next/no-img-element -- plain img keeps the component framework-agnostic */}
                <img src={p.image} alt="" className="hidden aspect-[16/10] w-20 shrink-0 rounded-sm object-cover [@media(pointer:coarse)]:block" />
                <span
                  className={cn(
                    "text-4xl font-normal tracking-[-0.04em] transition-[translate,opacity] duration-500 sm:text-6xl",
                    open && !lit && "opacity-35",
                    lit && "-translate-x-2.5",
                  )}
                  style={{ transitionTimingFunction: EASE }}
                >
                  {p.title}
                </span>
                <span
                  className={cn("ml-auto text-right text-sm text-muted-foreground transition-[translate,opacity] duration-500", open && !lit && "opacity-35", lit && "translate-x-2.5")}
                  style={{ transitionTimingFunction: EASE }}
                >
                  {p.label}
                </span>
              </a>
            </li>
          )
        })}
      </ul>

      <div ref={frame} aria-hidden className="pointer-events-none absolute top-0 left-0 z-10 [@media(pointer:coarse)]:hidden" style={{ width, height }}>
        <div
          className="size-full overflow-hidden rounded-sm bg-muted transition-[scale] duration-[400ms]"
          style={{ scale: open ? "1" : "0", transitionTimingFunction: EASE }}
        >
          <div className="size-full transition-[translate] duration-500" style={{ translate: `0 ${-100 * Math.max(0, active)}%`, transitionTimingFunction: EASE }}>
            {projects.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element -- plain img keeps the component framework-agnostic
              <img key={p.title} src={p.image} alt="" className="block size-full object-cover" />
            ))}
          </div>
        </div>
        {/* Copia: a round badge rides the frame, after Dennis Snellenberg's "View" cursor. */}
        {cursorLabel && (
          <span
            className="absolute top-1/2 left-1/2 grid size-20 -translate-1/2 place-items-center rounded-full bg-[#ff4d1c] text-sm font-medium text-white transition-[scale] duration-[400ms]"
            style={{ scale: open ? "1" : "0", transitionTimingFunction: EASE, transitionDelay: open ? "60ms" : "0ms" }}
          >
            {cursorLabel}
          </span>
        )}
      </div>
    </div>
  )
}
