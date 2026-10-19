"use client"

import { useRef, useState } from "react"
import { motion, useAnimationFrame, useMotionTemplate, useMotionValue, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

export type GlowBorderButtonProps = Omit<React.ComponentProps<"button">, "color"> & {
  /** Length of the beam in px (it is a square travelling along the edge). */
  size?: number
  /** Seconds for one lap at rest. */
  duration?: number
  /** Lap speed multiplier while hovered or focused (1 = no change). */
  hoverSpeed?: number
  /** Leading color of the beam. */
  colorFrom?: string
  /** Trailing color of the beam. */
  colorTo?: string
  /** Border thickness in px. */
  borderWidth?: number
  /** Blur radius in px of the halo that bleeds outside the border (0 = off). */
  glow?: number
  /** Run the beam counter-clockwise. */
  reverse?: boolean
}

/** A button whose border carries a beam of light that travels around it. */
export function GlowBorderButton({
  size = 60,
  duration = 4,
  hoverSpeed = 3,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  borderWidth = 1.5,
  glow = 14,
  reverse = false,
  className,
  children,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: GlowBorderButtonProps) {
  const reduceMotion = useReducedMotion()
  const [boost, setBoost] = useState(false)
  const progress = useMotionValue(12)
  const speed = useRef(1)

  // Drive offset-distance by hand so the speed can ease up and down mid-lap
  // (changing a Motion `duration` would restart the loop and jump the beam).
  useAnimationFrame((_, delta) => {
    if (reduceMotion) return
    const target = boost ? hoverSpeed : 1
    speed.current += (target - speed.current) * Math.min(1, delta / 180)
    const step = (delta / 1000 / duration) * 100 * speed.current
    const next = (progress.get() + (reverse ? -step : step) + 100) % 100
    progress.set(next)
  })

  const offsetDistance = useMotionTemplate`${progress}%`
  const beamStyle = {
    width: size,
    offsetPath: `rect(0 auto auto 0 round ${size}px)`,
    offsetDistance,
    background: `linear-gradient(to left, ${colorFrom}, ${colorTo}, transparent)`,
  }

  return (
    <button
      type="button"
      onPointerEnter={(e) => (setBoost(true), onPointerEnter?.(e))}
      onPointerLeave={(e) => (setBoost(false), onPointerLeave?.(e))}
      onFocus={(e) => (setBoost(true), onFocus?.(e))}
      onBlur={(e) => (setBoost(false), onBlur?.(e))}
      className={cn(
        "group relative isolate inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium",
        "bg-background text-foreground outline-none transition-transform active:scale-[0.98]",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      {...props}
    >
      {/* Halo: the same beam, blurred, behind the button so it bleeds outside the edge. */}
      {glow > 0 && !reduceMotion && (
        <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit]">
          <motion.span
            className="absolute aspect-square opacity-45"
            style={{ ...beamStyle, filter: `blur(${glow}px)` }}
          />
        </span>
      )}
      {/* Opaque face (with a resting border) so the halo only shows outside the edge. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-[5] rounded-[inherit] bg-background"
        style={{ boxShadow: `inset 0 0 0 ${borderWidth}px var(--border)` }}
      />
      {/* Beam: masked to the border ring only (padding-box minus border-box). */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] border-transparent"
        style={{
          borderWidth,
          borderStyle: "solid",
          mask: "linear-gradient(transparent, transparent) padding-box, linear-gradient(#000, #000) border-box",
          maskComposite: "intersect",
        }}
      >
        {reduceMotion ? (
          <span
            className="absolute inset-0 rounded-[inherit]"
            style={{ background: `linear-gradient(90deg, ${colorTo}, ${colorFrom})`, opacity: 0.8 }}
          />
        ) : (
          <motion.span className="absolute aspect-square" style={beamStyle} />
        )}
      </span>
      <span className="relative inline-flex items-center gap-2">{children}</span>
    </button>
  )
}
