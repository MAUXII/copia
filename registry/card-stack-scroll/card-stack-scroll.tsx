"use client"

import { useEffect, useLayoutEffect, useRef } from "react"
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react"
import { cn } from "@/lib/utils"

export type CardStackScrollProps = {
  items: React.ReactNode[]
  /** Card height: pixels or any CSS length (e.g. "60vh"). */
  cardHeight?: number | string
  /** Distance from the top of the scroll area where cards pin (px). */
  top?: number
  /** Vertical offset between stacked cards (px). */
  peek?: number
  /** How much each buried card shrinks. */
  scaleStep?: number
  /** Scroll the page slowly on its own until the user interacts (px per second). */
  autoScroll?: number
  className?: string
}

/** Nearest ancestor that actually scrolls, or null for the window. */
function getScrollParent(el: HTMLElement | null): HTMLElement | null {
  for (let node = el?.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node)
    if ((overflowY === "auto" || overflowY === "scroll") && node.scrollHeight > node.clientHeight) return node
  }
  return null
}

/**
 * Cards pin near the top and pile up into a stack as the page scrolls.
 * Uses whatever already scrolls (the window or a scrolling parent); it never
 * creates its own scroll box.
 */
export function CardStackScroll({ items, cardHeight = "min(60vh, 420px)", top = 24, peek = 16, scaleStep = 0.05, autoScroll, className }: CardStackScrollProps) {
  const list = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLElement | null>(null)
  const reduceMotion = useReducedMotion()

  // Runs before useScroll subscribes, so it tracks the right scroller.
  useLayoutEffect(() => {
    scroller.current = getScrollParent(list.current)
  }, [])

  const { scrollYProgress } = useScroll({ container: scroller, target: list, offset: ["start start", "end end"] })

  useEffect(() => {
    if (!autoScroll || reduceMotion) return
    const el = scroller.current ?? document.scrollingElement ?? document.documentElement
    let frame = 0
    let last = performance.now()
    let position = el.scrollTop // float accumulator: scrollTop may snap to whole pixels
    let stopped = false
    const stop = () => (stopped = true)
    const step = (now: number) => {
      if (stopped) return
      const max = el.scrollHeight - el.clientHeight
      position = position >= max - 1 ? 0 : position + (autoScroll * (now - last)) / 1000
      el.scrollTop = position
      last = now
      frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    const events = ["wheel", "pointerdown", "touchstart", "keydown"] as const
    events.forEach((type) => window.addEventListener(type, stop, { once: true, capture: true }))
    return () => {
      cancelAnimationFrame(frame)
      events.forEach((type) => window.removeEventListener(type, stop, { capture: true }))
    }
  }, [autoScroll, reduceMotion])

  const height = typeof cardHeight === "number" ? `${cardHeight}px` : cardHeight

  return (
    <div ref={list} className={cn("relative flex flex-col gap-10", className)} style={{ paddingBottom: `calc(100vh - ${height} - ${top}px)` }}>
      {items.map((item, i) => (
        <StackCard key={i} index={i} count={items.length} progress={scrollYProgress} top={top + i * peek} scaleStep={scaleStep} height={height}>
          {item}
        </StackCard>
      ))}
    </div>
  )
}

function StackCard({ index, count, progress, top, scaleStep, height, children }: { index: number; count: number; progress: MotionValue<number>; top: number; scaleStep: number; height: string; children: React.ReactNode }) {
  // Each card starts shrinking once the cards after it begin to cover it.
  const start = index / count
  const scale = useTransform(progress, [start, 1], [1, 1 - (count - 1 - index) * scaleStep])
  const filter = useTransform(progress, [start, 1], ["brightness(1)", `brightness(${1 - (count - 1 - index) * 0.08})`])
  return (
    <div className="sticky" style={{ top, height }}>
      <motion.div className="size-full origin-top overflow-hidden rounded-3xl shadow-[0_-8px_30px_rgb(0_0_0/0.25)]" style={{ scale, filter }}>
        {children}
      </motion.div>
    </div>
  )
}
