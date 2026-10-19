"use client"

import { useCallback, useEffect, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

export type PerspectiveCarouselProps = {
  items: React.ReactNode[]
  /** Card width in pixels (cards are square). */
  size?: number
  /** Horizontal distance between card centers, as a fraction of `size`. */
  spacing?: number
  /** Advance automatically every N ms. Pauses on focus, after any interaction and with reduced motion. */
  autoplay?: number
  /** Pause autoplay while the pointer is over the carousel. */
  pauseOnHover?: boolean
  /** Accessible name of the carousel. */
  label?: string
  className?: string
}

const SPRING = { type: "spring", bounce: 0.18, duration: 0.7 } as const

/** Cover-flow style carousel: the center card is large and flat, neighbours shrink and turn away. */
export function PerspectiveCarousel({ items, size = 220, spacing = 0.78, autoplay, pauseOnHover = true, label = "Carousel", className }: PerspectiveCarouselProps) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [interacted, setInteracted] = useState(false)
  const reduceMotion = useReducedMotion()
  const count = items.length
  const go = useCallback((index: number) => setActive(((index % count) + count) % count), [count])
  // User-driven navigation stops autoplay for good (WCAG 2.2.2).
  const navigate = (index: number) => {
    setInteracted(true)
    go(index)
  }

  useEffect(() => {
    if (!autoplay || paused || interacted || reduceMotion) return
    const id = setInterval(() => go(active + 1), autoplay)
    return () => clearInterval(id)
  }, [autoplay, paused, interacted, reduceMotion, active, go])

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") navigate(active + 1)
        if (e.key === "ArrowLeft") navigate(active - 1)
      }}
      onPointerEnter={() => pauseOnHover && setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={cn("flex flex-col items-center gap-5 outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
    >
      <motion.div
        className="relative cursor-grab touch-pan-y active:cursor-grabbing"
        style={{ width: size * (1 + spacing * 2.4), height: size * 1.1, perspective: 1200 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={(_, info) => {
          if (info.offset.x < -40) navigate(active + 1)
          else if (info.offset.x > 40) navigate(active - 1)
        }}
      >
        {items.map((item, i) => {
          // Shortest signed distance from the active card, so the carousel wraps around.
          let offset = i - active
          if (offset > count / 2) offset -= count
          if (offset < -count / 2) offset += count
          const distance = Math.abs(offset)
          return (
            <motion.button
              key={i}
              type="button"
              aria-label={`Item ${i + 1} of ${count}`}
              aria-current={offset === 0}
              tabIndex={-1}
              onClick={() => navigate(i)}
              className="absolute top-1/2 left-1/2 overflow-hidden rounded-md shadow-2xl"
              style={{ width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, zIndex: 10 - distance }}
              initial={false}
              animate={{
                x: offset * size * spacing,
                scale: offset === 0 ? 1 : Math.max(0.55, 0.82 - (distance - 1) * 0.12),
                rotateY: reduceMotion ? 0 : Math.max(-40, Math.min(40, -offset * 22)),
                opacity: distance > 2 ? 0 : 1,
                filter: `brightness(${offset === 0 ? 1 : 0.7})`,
              }}
              transition={reduceMotion ? { duration: 0 } : SPRING}
            >
              {item}
            </motion.button>
          )
        })}
      </motion.div>

      <div className="flex gap-1.5" role="tablist" aria-label="Choose item">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={`Go to item ${i + 1}`}
            onClick={() => navigate(i)}
            className={cn("h-1.5 rounded-full transition-all", i === active ? "w-4 bg-foreground" : "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground")}
          />
        ))}
      </div>
    </div>
  )
}
