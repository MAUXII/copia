"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type Props = {
  /** The element that scrolls (its native scrollbar should be hidden). */
  scroller: React.RefObject<HTMLElement | null>
  /** The rounded card the scrollbar wraps around. */
  card: React.RefObject<HTMLElement | null>
  /** Positioned ancestor the SVG overlays. */
  container: React.RefObject<HTMLElement | null>
  /** Card corner radius (px). */
  radius?: number
  /** Distance between the scrollbar and the card edge (px). */
  gap?: number
}

type Geometry = { d: string; length: number; top: number; bottom: number }

/**
 * A scrollbar drawn as an SVG path that follows the card's left edge and bends
 * around its rounded top and bottom corners. The thumb is a dash slid along the
 * path, so it curves at the ends of its travel.
 */
export function CurvedScrollbar({ scroller, card, container, radius = 16, gap = 7 }: Props) {
  const path = useRef<SVGPathElement>(null)
  const [geo, setGeo] = useState<Geometry | null>(null)
  const [thumb, setThumb] = useState({ start: 0, size: 1 })
  const [active, setActive] = useState(false)
  const drag = useRef<{ y: number; scrollTop: number } | null>(null)

  const measure = useCallback(() => {
    const box = container.current?.getBoundingClientRect()
    const rect = card.current?.getBoundingClientRect()
    if (!box || !rect || rect.width === 0) return setGeo(null)
    const x = rect.left - box.left - gap // vertical run, just outside the card
    const top = rect.top - box.top
    const bottom = rect.bottom - box.top
    const r = radius + gap // concentric with the card corner
    const cx = x + r // where the curve meets the card's top/bottom edges
    const arc = Math.min(r, (bottom - top) / 4)
    // Start on the top edge, bend down around the corner, run down, bend back out.
    const d = [
      `M ${cx + 6} ${top - gap}`,
      `L ${cx} ${top - gap}`,
      `A ${arc} ${arc} 0 0 0 ${x} ${top - gap + arc}`,
      `L ${x} ${bottom + gap - arc}`,
      `A ${arc} ${arc} 0 0 0 ${cx} ${bottom + gap}`,
      `L ${cx + 6} ${bottom + gap}`,
    ].join(" ")
    setGeo({ d, length: 0, top, bottom })
  }, [card, container, gap, radius])

  const sync = useCallback(() => {
    const el = scroller.current
    if (!el) return
    const size = el.scrollHeight > 0 ? Math.min(1, el.clientHeight / el.scrollHeight) : 1
    const max = Math.max(1, el.scrollHeight - el.clientHeight)
    setThumb({ size, start: (el.scrollTop / max) * (1 - size) })
  }, [scroller])

  useEffect(() => {
    const el = scroller.current
    measure()
    sync()
    const ro = new ResizeObserver(() => {
      measure()
      sync()
    })
    if (card.current) ro.observe(card.current)
    if (container.current) ro.observe(container.current)
    if (el) ro.observe(el)
    if (el?.firstElementChild) ro.observe(el.firstElementChild)
    el?.addEventListener("scroll", sync, { passive: true })
    window.addEventListener("resize", measure)
    // The panel animates its width; keep the path glued to the card while it moves.
    let frame = 0
    const follow = () => {
      measure()
      frame = requestAnimationFrame(follow)
    }
    frame = requestAnimationFrame(follow)
    const stopFollow = setTimeout(() => cancelAnimationFrame(frame), 700)
    return () => {
      ro.disconnect()
      el?.removeEventListener("scroll", sync)
      window.removeEventListener("resize", measure)
      cancelAnimationFrame(frame)
      clearTimeout(stopFollow)
    }
  }, [scroller, card, container, measure, sync])

  if (!geo || thumb.size >= 1) return null

  // Map a pointer y to a scroll position along the straight run.
  const scrollToY = (clientY: number) => {
    const el = scroller.current
    const box = container.current?.getBoundingClientRect()
    if (!el || !box) return
    const t = (clientY - box.top - geo.top) / (geo.bottom - geo.top)
    el.scrollTo({ top: Math.max(0, Math.min(1, t)) * (el.scrollHeight - el.clientHeight), behavior: "smooth" })
  }

  return (
    <svg className="pointer-events-none absolute inset-0 z-20 hidden size-full md:block" aria-hidden>
      {/* Track: wide invisible hit area plus a faint line. */}
      <path
        d={geo.d}
        fill="none"
        stroke="transparent"
        strokeWidth={14}
        className="pointer-events-auto cursor-pointer"
        onPointerDown={(e) => scrollToY(e.clientY)}
        onPointerEnter={() => setActive(true)}
        onPointerLeave={() => !drag.current && setActive(false)}
      />
      <path d={geo.d} fill="none" stroke="white" strokeOpacity={active ? 0.12 : 0.05} strokeWidth={3} strokeLinecap="round" className="transition-[stroke-opacity]" />
      {/* Thumb: one dash of a path normalized to length 1. */}
      <path
        ref={path}
        d={geo.d}
        pathLength={1}
        fill="none"
        stroke="white"
        strokeOpacity={active ? 0.6 : 0.3}
        strokeWidth={active ? 5 : 3}
        strokeLinecap="round"
        strokeDasharray={`${thumb.size} 2`}
        strokeDashoffset={-thumb.start}
        className="pointer-events-auto cursor-grab transition-[stroke-opacity,stroke-width] active:cursor-grabbing"
        onPointerEnter={() => setActive(true)}
        onPointerLeave={() => !drag.current && setActive(false)}
        onPointerDown={(e) => {
          e.stopPropagation()
          e.currentTarget.setPointerCapture(e.pointerId)
          drag.current = { y: e.clientY, scrollTop: scroller.current?.scrollTop ?? 0 }
        }}
        onPointerMove={(e) => {
          const el = scroller.current
          if (!drag.current || !el) return
          const ratio = (el.scrollHeight - el.clientHeight) / ((geo.bottom - geo.top) * (1 - thumb.size))
          el.scrollTop = drag.current.scrollTop + (e.clientY - drag.current.y) * ratio
        }}
        onPointerUp={() => {
          drag.current = null
          setActive(false)
        }}
      />
    </svg>
  )
}
