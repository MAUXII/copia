"use client"

import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform, type AnimationPlaybackControls, type MotionValue } from "motion/react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export type InvertedPerspectiveImage = { src: string; alt: string }

export type InvertedPerspectiveCarouselProps = {
  images: InvertedPerspectiveImage[]
  /** Slide width and height in px. */
  size?: number
  /** Space between slides in px. */
  spaceBetween?: number
  /** Degrees each slide turns per slide away from the centre. Negative turns the other way. */
  rotate?: number
  /** How far back each slide sits per slide away from the centre, in px. */
  depth?: number
  /** Multiplies rotate and depth. */
  modifier?: number
  /** Darken the turned-away edge of each side slide. */
  slideShadows?: boolean
  loop?: boolean
  /** Advance every N ms; hovering, focusing or touching pauses it. 0 turns it off. */
  autoplay?: number
  /** Pause autoplay while the pointer is over the carousel. */
  pauseOnHover?: boolean
  showPagination?: boolean
  showNavigation?: boolean
  /** A soft mirror of the slides on the floor. */
  reflection?: boolean
  className?: string
  onActiveChange?: (index: number) => void
}

// Swiper's coverflow, measured from Skiper UI's setup: rotate 40, depth 100, modifier 1, shadows on.
const SNAP = { type: "spring", stiffness: 260, damping: 32, mass: 0.9 } as const
const FLICK = 0.22 // seconds of release velocity projected before snapping
const DRAG_SLOP = 5

const wrap = (value: number, count: number) => ((value % count) + count) % count

function Slide({
  image,
  index,
  count,
  position,
  step,
  size,
  rotate,
  depth,
  modifier,
  loop,
  slideShadows,
  reflection,
  onSelect,
}: {
  image: InvertedPerspectiveImage
  index: number
  count: number
  position: MotionValue<number>
  step: number
  size: number
  rotate: number
  depth: number
  modifier: number
  loop: boolean
  slideShadows: boolean
  reflection: boolean
  onSelect: () => void
}) {
  // Signed distance from the centre in slides; wraps around when looping.
  const offset = useTransform(position, (at) => {
    let d = index - at
    if (loop) d = wrap(d + count / 2, count) - count / 2
    return d
  })
  // Swiper's offsetMultiplier: positive on the left, negative on the right.
  const transform = useTransform(offset, (d) => {
    const m = -d * modifier
    return `translate3d(${d * step}px, 0, ${-depth * Math.abs(m)}px) rotateY(${rotate * m}deg)`
  })
  const zIndex = useTransform(offset, (d) => count - Math.round(Math.abs(d)))
  const opacity = useTransform(offset, (d) => (Math.abs(d) > 3.6 ? 0 : 1))
  const shadowLeft = useTransform(offset, (d) => Math.max(0, -d * modifier))
  const shadowRight = useTransform(offset, (d) => Math.max(0, d * modifier))

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-label={image.alt}
      tabIndex={-1}
      className="absolute top-0 left-1/2 overflow-hidden outline-none"
      style={{
        width: size,
        height: size,
        marginLeft: -size / 2,
        transform,
        zIndex,
        opacity,
        transformStyle: "preserve-3d",
        WebkitBoxReflect: reflection ? "below 2px linear-gradient(transparent 62%, rgb(0 0 0 / 0.22))" : undefined,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- plain img keeps the component framework-agnostic */}
      <img src={image.src} alt="" draggable={false} className="pointer-events-none size-full object-cover select-none" />
      {slideShadows && (
        <>
          <motion.span aria-hidden className="absolute inset-0 bg-gradient-to-l from-black/50 to-transparent" style={{ opacity: shadowLeft }} />
          <motion.span aria-hidden className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" style={{ opacity: shadowRight }} />
        </>
      )}
    </motion.button>
  )
}

/**
 * Coverflow carousel after Skiper UI's inverted perspective carousel: the side
 * slides turn on their vertical axis and fall back in depth, the turned-away
 * edge in shadow. Drag or flick it, scroll sideways, use the arrows or click a
 * slide; it loops.
 */
export function InvertedPerspectiveCarousel({
  images,
  size = 300,
  spaceBetween = 0,
  rotate = 40,
  depth = 100,
  modifier = 1,
  slideShadows = true,
  loop = true,
  autoplay = 0,
  pauseOnHover = true,
  showPagination = true,
  showNavigation = false,
  reflection = false,
  className,
  onActiveChange,
}: InvertedPerspectiveCarouselProps) {
  const count = images.length
  const step = size + spaceBetween
  const reduced = useReducedMotion()
  const position = useMotionValue(0)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const anim = useRef<AnimationPlaybackControls | null>(null)
  const drag = useRef<{ id: number; x: number; from: number; last: number; time: number; velocity: number; moved: boolean } | null>(null)
  const suppressClick = useRef(false)
  const wheelSnap = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const callback = useRef(onActiveChange)

  useEffect(() => {
    callback.current = onActiveChange
  })

  useMotionValueEvent(position, "change", (at) => {
    const index = loop ? wrap(Math.round(at), count) : Math.min(count - 1, Math.max(0, Math.round(at)))
    if (index !== active) {
      setActive(index)
      callback.current?.(index)
    }
  })

  const clamp = useCallback((at: number) => (loop ? at : Math.min(count - 1, Math.max(0, at))), [count, loop])

  /** Glide to an unwrapped slide index; looping keeps counting past the ends. */
  const goTo = useCallback(
    (target: number) => {
      anim.current?.stop()
      const to = clamp(Math.round(target))
      if (reduced) position.set(to)
      else anim.current = animate(position, to, SNAP)
    },
    [clamp, position, reduced],
  )

  /** Shortest way to a slide by its real index. */
  const goToIndex = (index: number) => {
    const at = position.get()
    let delta = index - wrap(Math.round(at), count)
    if (loop && Math.abs(delta) > count / 2) delta -= Math.sign(delta) * count
    goTo(Math.round(at) + delta)
  }

  // Copia: autoplay that waits while the pointer, focus or a finger is on it.
  useEffect(() => {
    if (!autoplay || paused || reduced || count < 2) return
    const id = setInterval(() => goTo(Math.round(position.get()) + 1), autoplay)
    return () => clearInterval(id)
  }, [autoplay, paused, reduced, count, goTo, position])

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Image carousel"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return
        e.preventDefault()
        goTo(Math.round(position.get()) + (e.key === "ArrowRight" ? 1 : -1))
      }}
      onPointerEnter={() => pauseOnHover && setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={cn("relative flex w-full flex-col items-center gap-6 outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
    >
      <p className="sr-only" aria-live="polite">
        Slide {active + 1} of {count}: {images[active]?.alt}
      </p>
      <div
        className="relative w-full cursor-grab touch-pan-y overflow-x-clip select-none active:cursor-grabbing"
        style={{ height: size, perspective: 1200 }}
        // Copia: horizontal wheel and trackpad scroll the carousel.
        onWheel={(e) => {
          if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
          anim.current?.stop()
          position.set(clamp(position.get() + e.deltaX / step))
          clearTimeout(wheelSnap.current)
          wheelSnap.current = setTimeout(() => goTo(position.get()), 120)
        }}
        onPointerDown={(e) => {
          if (e.button !== 0) return
          anim.current?.stop()
          suppressClick.current = false
          drag.current = { id: e.pointerId, x: e.clientX, from: position.get(), last: e.clientX, time: performance.now(), velocity: 0, moved: false }
        }}
        onPointerMove={(e) => {
          const d = drag.current
          if (!d || d.id !== e.pointerId) return
          if (!d.moved && Math.abs(e.clientX - d.x) < DRAG_SLOP) return
          if (!d.moved) e.currentTarget.setPointerCapture(e.pointerId)
          d.moved = true
          const now = performance.now()
          // Slides per second, smoothed.
          d.velocity = d.velocity * 0.3 + ((d.last - e.clientX) / step / Math.max(8, now - d.time)) * 1000 * 0.7
          d.last = e.clientX
          d.time = now
          position.set(clamp(d.from - (e.clientX - d.x) / step))
        }}
        onPointerUp={(e) => {
          const d = drag.current
          drag.current = null
          if (!d || !d.moved) return
          suppressClick.current = true
          if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
          const velocity = performance.now() - d.time > 90 ? 0 : d.velocity
          goTo(position.get() + velocity * FLICK)
        }}
        onPointerCancel={() => {
          drag.current = null
          goTo(position.get())
        }}
        onClickCapture={(e) => {
          if (!suppressClick.current) return
          suppressClick.current = false
          e.stopPropagation()
        }}
      >
        <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
          {images.map((image, index) => (
            <Slide
              key={index}
              image={image}
              index={index}
              count={count}
              position={position}
              step={step}
              size={size}
              rotate={rotate}
              depth={depth}
              modifier={modifier}
              loop={loop}
              slideShadows={slideShadows}
              reflection={reflection}
              onSelect={() => goToIndex(index)}
            />
          ))}
        </div>
        {showNavigation && (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => goTo(Math.round(position.get()) - 1)}
              className="absolute top-1/2 left-2 z-[999] grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => goTo(Math.round(position.get()) + 1)}
              className="absolute top-1/2 right-2 z-[999] grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>
      {showPagination && (
        <div className="flex gap-1.5" role="tablist" aria-label="Slides">
          {images.map((image, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => goToIndex(index)}
              className={cn("h-1.5 rounded-full transition-all", index === active ? "w-4 bg-foreground" : "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground")}
            />
          ))}
        </div>
      )}
    </div>
  )
}
