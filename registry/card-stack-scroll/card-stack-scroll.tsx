"use client"

import { useEffect, useRef } from "react"
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react"
import { cn } from "@/lib/utils"

export type CardStackScrollProps = {
  items: React.ReactNode[]
  /** Height of the scroll area in pixels. */
  height?: number
  /** Card height in pixels. */
  cardHeight?: number
  /** Vertical offset between stacked cards (px). */
  peek?: number
  /** How much each buried card shrinks. */
  scaleStep?: number
  /** Scroll slowly on its own until the user interacts (px per second). */
  autoScroll?: number
  className?: string
}

/** Cards that pin to the top and pile up into a stack as you scroll. */
export function CardStackScroll({ items, height = 360, cardHeight = 200, peek = 14, scaleStep = 0.05, autoScroll, className }: CardStackScrollProps) {
  const container = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ container })
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const el = container.current
    if (!autoScroll || !el || reduceMotion) return
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
    el.addEventListener("wheel", stop, { once: true })
    el.addEventListener("pointerdown", stop, { once: true })
    el.addEventListener("touchstart", stop, { once: true })
    el.addEventListener("keydown", stop, { once: true })
    return () => cancelAnimationFrame(frame)
  }, [autoScroll, reduceMotion])

  return (
    <div
      ref={container}
      tabIndex={0}
      role="region"
      aria-label="Card stack"
      className={cn("relative overflow-y-auto overscroll-contain outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
      style={{ height }}
    >
      <div className="flex flex-col px-4" style={{ paddingTop: 16, paddingBottom: height - cardHeight }}>
        {items.map((item, i) => (
          <StackCard key={i} index={i} count={items.length} progress={scrollYProgress} peek={peek} scaleStep={scaleStep} cardHeight={cardHeight}>
            {item}
          </StackCard>
        ))}
      </div>
    </div>
  )
}

function StackCard({ index, count, progress, peek, scaleStep, cardHeight, children }: { index: number; count: number; progress: MotionValue<number>; peek: number; scaleStep: number; cardHeight: number; children: React.ReactNode }) {
  // Each card starts shrinking once the cards after it begin to cover it.
  const start = index / count
  const scale = useTransform(progress, [start, 1], [1, 1 - (count - 1 - index) * scaleStep])
  const brightness = useTransform(progress, [start, 1], [1, 1 - (count - 1 - index) * 0.08])
  const filter = useTransform(brightness, (b) => `brightness(${b})`)
  return (
    <div className="sticky mb-6" style={{ top: 16 + index * peek, height: cardHeight }}>
      <motion.div className="size-full origin-top overflow-hidden rounded-2xl shadow-[0_-8px_30px_rgb(0_0_0/0.25)]" style={{ scale, filter }}>
        {children}
      </motion.div>
    </div>
  )
}
