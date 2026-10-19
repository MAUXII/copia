"use client"

import { useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

export type CursorTrailProps = React.ComponentProps<"div"> & {
  /** What gets dropped along the path: images, stickers, emoji, anything. */
  items: React.ReactNode[]
  /** Pixels the cursor travels between two drops. */
  spacing?: number
  /** How long each drop stays before shrinking away (ms). */
  lifetime?: number
  /** Maximum drops on screen at once. */
  max?: number
  /** Size of each drop in pixels. */
  size?: number
}

type Drop = { id: number; x: number; y: number; rotate: number; item: number }

/** Drops a trail of images or stickers behind the cursor that pop in and shrink away. */
export function CursorTrail({ items, spacing = 60, lifetime = 900, max = 14, size = 96, className, children, onPointerMove, ...props }: CursorTrailProps) {
  const [drops, setDrops] = useState<Drop[]>([])
  const last = useRef<{ x: number; y: number } | null>(null)
  const next = useRef(0)
  const reduceMotion = useReducedMotion()

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onPointerMove={(event) => {
        onPointerMove?.(event)
        if (reduceMotion || items.length === 0) return
        const rect = event.currentTarget.getBoundingClientRect()
        const point = { x: event.clientX - rect.left, y: event.clientY - rect.top }
        if (last.current && Math.hypot(point.x - last.current.x, point.y - last.current.y) < spacing) return
        last.current = point
        const id = next.current++
        const drop = { id, ...point, rotate: Math.random() * 30 - 15, item: id % items.length }
        setDrops((current) => [...current.slice(-(max - 1)), drop])
        setTimeout(() => setDrops((current) => current.filter((d) => d.id !== id)), lifetime)
      }}
      onPointerLeave={() => (last.current = null)}
      {...props}
    >
      {children}
      <AnimatePresence>
        {drops.map((drop) => (
          <motion.div
            key={drop.id}
            aria-hidden
            className="pointer-events-none absolute grid place-items-center"
            style={{ left: drop.x - size / 2, top: drop.y - size / 2, width: size, height: size }}
            initial={{ scale: 0, rotate: drop.rotate - 20 }}
            animate={{ scale: 1, rotate: drop.rotate }}
            exit={{ scale: 0, opacity: 0, transition: { duration: 0.35, ease: "backIn" } }}
            transition={{ type: "spring", bounce: 0.5, duration: 0.45 }}
          >
            {items[drop.item]}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
