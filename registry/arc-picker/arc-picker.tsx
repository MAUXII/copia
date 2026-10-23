"use client"

import { animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform, type AnimationPlaybackControls, type MotionValue } from "motion/react"
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export type ArcPickerOption = { value: string; label: string; disabled?: boolean }
export type ArcPickerSide = "top" | "bottom" | "left" | "right"

export type ArcPickerProps = Omit<React.ComponentProps<"div">, "children" | "defaultValue" | "onChange"> & {
  options: readonly ArcPickerOption[]
  value?: string
  defaultValue?: string
  /** Called for every enabled option crossed while dragging, scrolling or coasting. */
  onValueChange?: (value: string) => void
  /** The side the arc bows toward. Top and bottom scroll horizontally. */
  side?: ArcPickerSide
  /** Arc radius in px. Larger is gentler. */
  radius?: number
  /** Spacing between options along the arc, in px. */
  itemHeight?: number
  visibleCount?: number
  /** 0–1: how much options shrink and blur as they curve away. */
  depth?: number
  /** A dial of ticks on a concentric inner arc. */
  ticks?: boolean
  /** A short vibration on each detent, on devices that support it. */
  haptics?: boolean
  /** Color of the selected label, its brackets and its tick. */
  accent?: string
  disabled?: boolean
  /** Renders a hidden input so the picker works inside a form. */
  name?: string
}

// Springs measured from the reference: options settle on LAYOUT, brackets breathe on GLIDE.
const LAYOUT = { type: "spring", stiffness: 360, damping: 32, mass: 0.6 } as const
const GLIDE = { stiffness: 700, damping: 50, mass: 0.5 }
const COAST = 0.18 // seconds of flick velocity projected before snapping
const WHEEL_SETTLE_MS = 120
const BRACKET_SPACE = 24
const BRACKET_GAP = 4
const BRACKET_SPREAD = 6
const TICK_INSET = 26 // px between the label arc and the tick arc

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/** Point on the arc for an angle; `inset` moves it toward the arc's center. */
function place(angle: number, radius: number, side: ArcPickerSide, inset = 0) {
  const along = (radius - inset) * Math.sin(angle)
  const bend = inset + (radius - inset) * (1 - Math.cos(angle))
  const horizontal = side === "top" || side === "bottom"
  const x = horizontal ? along : side === "left" ? bend : -bend
  const y = horizontal ? (side === "top" ? bend : -bend) : along
  const rotate = ((side === "left" || side === "bottom" ? -angle : angle) * 180) / Math.PI
  return { x, y, rotate }
}

function falloff(distance: number, visible: number) {
  return clamp((visible / 2 + 0.5 - distance) / 1.5, 0, 1)
}

type Geometry = { side: ArcPickerSide; radius: number; spacing: number; visible: number; anchor: number | string; depth: number }

function anchorStyle(g: Geometry): React.CSSProperties {
  const horizontal = g.side === "top" || g.side === "bottom"
  return { top: horizontal ? (g.side === "top" ? 36 : "calc(100% - 36px)") : "50%", left: horizontal ? "50%" : g.anchor }
}

function ArcOption({ option, index, position, g, selected, disabled, accent, setRef, onSelect }: { option: ArcPickerOption; index: number; position: MotionValue<number>; g: Geometry; selected: boolean; disabled: boolean; accent: string; setRef: (el: HTMLButtonElement | null) => void; onSelect: () => void }) {
  const horizontal = g.side === "top" || g.side === "bottom"
  const shift = horizontal ? "-50%" : g.side === "left" ? "-100%" : "0%"
  const transform = useTransform(position, (at) => {
    const offset = index - at
    const { x, y, rotate } = place(clamp((offset * g.spacing) / g.radius, -1.5, 1.5), g.radius, g.side)
    const scale = 1 - g.depth * 0.22 * clamp(Math.abs(offset) / (g.visible / 2), 0, 1)
    return `translate3d(${x}px, ${y}px, 0) translate(${shift}, -50%) rotate(${rotate}deg) scale(${scale})`
  })
  const opacity = useTransform(position, (at) => falloff(Math.abs(index - at), g.visible) * (disabled || option.disabled ? 0.35 : 1))
  // Depth blur: zero on the selection, growing toward the faded ends.
  const filter = useTransform(position, (at) => {
    const blur = g.depth * 2.4 * clamp((Math.abs(index - at) - 0.6) / (g.visible / 2), 0, 1)
    return blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "none"
  })
  const pointerEvents = useTransform(position, (at) => (Math.abs(index - at) < g.visible / 2 ? "auto" : "none"))

  return (
    <motion.button
      ref={setRef}
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled || option.disabled}
      tabIndex={selected && !disabled ? 0 : -1}
      onClick={(event) => !event.defaultPrevented && onSelect()}
      className={cn(
        "absolute rounded-md px-2 py-1 text-2xl font-light whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-current disabled:cursor-not-allowed",
        !selected && "text-muted-foreground",
      )}
      style={{
        ...anchorStyle(g),
        color: selected ? accent : undefined,
        transformOrigin: horizontal ? "center" : g.side === "left" ? "right center" : "left center",
        maxWidth: horizontal ? "calc(100% - 4rem)" : "calc(100% - 3rem)",
        transform,
        opacity,
        filter,
        pointerEvents,
      }}
    >
      <span className="block truncate">{option.label}</span>
    </motion.button>
  )
}

/** One mark on the inner dial: a long tick per option, a short one between. */
function Tick({ at: mark, position, g, accent }: { at: number; position: MotionValue<number>; g: Geometry; accent: string }) {
  const horizontal = g.side === "top" || g.side === "bottom"
  const major = Number.isInteger(mark)
  const transform = useTransform(position, (at) => {
    const { x, y, rotate } = place(clamp(((mark - at) * g.spacing) / g.radius, -1.5, 1.5), g.radius, g.side, TICK_INSET)
    return `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${rotate}deg)`
  })
  const opacity = useTransform(position, (at) => falloff(Math.abs(mark - at), g.visible) * (major ? 0.55 : 0.3))
  const color = useTransform(position, (at) => (major && Math.abs(mark - at) < 0.5 ? accent : "currentColor"))
  const length = major ? 10 : 5
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute rounded-full bg-current text-muted-foreground"
      style={{ ...anchorStyle(g), width: horizontal ? 1.5 : length, height: horizontal ? length : 1.5, transform, opacity, color }}
    />
  )
}

/** The [ ] around the selection: springs to the label's width and spreads while you scroll. */
function Brackets({ width, spread, g, accent }: { width: MotionValue<number>; spread: MotionValue<number>; g: Geometry; accent: string }) {
  const horizontal = g.side === "top" || g.side === "bottom"
  const edge = (leading: boolean) => (size: number, amount: number) => {
    const extent = horizontal ? size / 2 : (g.side === "left") === leading ? size : 0
    const gap = BRACKET_GAP + clamp(amount, 0, 1) * BRACKET_SPREAD
    return `translate3d(${(leading ? -1 : 1) * (extent + gap)}px, -50%, 0) scaleY(${1 - clamp(amount, 0, 1) * 0.08})`
  }
  const lead = useTransform([width, spread], ([s = 0, a = 0]: number[]) => edge(true)(s, a))
  const trail = useTransform([width, spread], ([s = 0, a = 0]: number[]) => edge(false)(s, a))
  const opacity = useTransform(width, (s) => (s > 0 ? 0.85 : 0))
  return (
    <div aria-hidden className="pointer-events-none absolute size-0 text-2xl font-light" style={{ ...anchorStyle(g), color: accent }}>
      <motion.span className="absolute right-0" style={{ transform: lead, opacity }}>
        [
      </motion.span>
      <motion.span className="absolute left-0" style={{ transform: trail, opacity }}>
        ]
      </motion.span>
    </div>
  )
}

/** A radial single-choice picker: drag, flick, scroll or use the arrow keys. */
export function ArcPicker({
  options,
  value,
  defaultValue,
  onValueChange,
  side = "right",
  radius = 280,
  itemHeight = 48,
  visibleCount = 7,
  depth = 0.6,
  ticks = true,
  haptics = true,
  accent = "#2b7fff",
  disabled = false,
  name,
  className,
  style,
  "aria-label": label = "Choose an option",
  ...props
}: ArcPickerProps) {
  const reduced = !!useReducedMotion()
  const horizontal = side === "top" || side === "bottom"
  const hintId = useId()
  const root = useRef<HTMLDivElement>(null)
  const buttons = useRef(new Map<string, HTMLButtonElement>())

  // The arc is laid out from live measurements and motion values; render it after mount so
  // server HTML never disagrees with the first client frame.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const [internal, setInternal] = useState(defaultValue)
  const wanted = value ?? internal
  const firstEnabled = Math.max(0, options.findIndex((o) => !o.disabled))
  const found = options.findIndex((o) => o.value === wanted && !o.disabled)
  const selectedIndex = found < 0 ? firstEnabled : found
  const selected = options[selectedIndex]

  // Layout: horizontal sides make room for the widest label.
  const [size, setSize] = useState({ width: 0, label: 0 })
  const row = Math.max(32, itemHeight)
  const count = Math.max(3, Math.floor(visibleCount))
  const spacing = horizontal ? Math.max(row, size.label + BRACKET_SPACE * 2) : row
  const curve = horizontal ? Math.max(radius, spacing * 2) : Math.max(120, radius)
  const visible = horizontal ? Math.min(count, Math.max(1, (size.width || count * spacing) / spacing)) : count
  const room = BRACKET_SPACE + (ticks ? TICK_INSET : 0)
  const inset = Math.max(room, Math.min(size.width * 0.42, size.width - size.label - BRACKET_SPACE))
  const anchor = size.width ? (side === "left" ? size.width - inset : inset) : side === "left" ? "58%" : "42%"
  const g: Geometry = { side, radius: curve, spacing, visible, anchor, depth: reduced ? 0 : clamp(depth, 0, 1) }
  const height = horizontal
    ? Math.ceil(Math.max(row * 2, curve * (1 - Math.cos(Math.min(1.35, (visible * spacing) / (2 * curve)))) + row + 24 + (ticks ? TICK_INSET : 0)))
    : count * row

  const position = useMotionValue(selectedIndex)
  const activity = useMotionValue(0)
  const spread = useSpring(activity, GLIDE)
  const frameTarget = useMotionValue(0)
  const frameWidth = useSpring(frameTarget, LAYOUT)
  const measured = useRef(false)

  const anim = useRef<AnimationPlaybackControls | null>(null)
  const wheelTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wheelTarget = useRef<number | null>(null)
  const tracking = useRef(false)
  const requested = useRef(selectedIndex)
  const suppressClick = useRef(false)
  const drag = useRef<{ id: number; start: number; from: number; last: number; time: number; velocity: number; moved: boolean } | null>(null)
  // Handlers in effects read the latest props through this ref.
  const latest = useRef({ options, disabled, reduced, spacing, horizontal, haptics, controlled: value !== undefined, onValueChange })
  useLayoutEffect(() => {
    latest.current = { options, disabled, reduced, spacing, horizontal, haptics, controlled: value !== undefined, onValueChange }
  })

  const measureFrame = useCallback(() => {
    const width = buttons.current.get(selected?.value ?? "")?.offsetWidth ?? 0
    frameTarget.set(width)
    if (!measured.current || reduced) frameWidth.jump(width)
    measured.current = true
    // Re-measure once the options exist.
    void mounted
  }, [frameTarget, frameWidth, reduced, selected?.value, mounted])

  useLayoutEffect(() => {
    const element = root.current
    if (!element) return
    const measure = () => {
      const width = element.clientWidth
      const widest = Math.max(0, ...Array.from(buttons.current.values(), (b) => b.offsetWidth))
      setSize((s) => (s.width === width && s.label === widest ? s : { width, label: widest }))
      measureFrame()
    }
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    buttons.current.forEach((b) => observer.observe(b))
    measure()
    return () => observer.disconnect()
  }, [options, measureFrame])

  const settle = useCallback(
    (index: number, immediate = false) => {
      anim.current?.stop()
      const done = () => {
        tracking.current = false
        anim.current = null
        wheelTarget.current = null
        activity.set(0)
      }
      if (immediate || latest.current.reduced) {
        position.jump(index)
        done()
      } else anim.current = animate(position, index, { ...LAYOUT, onComplete: done })
    },
    [activity, position],
  )

  const stop = useCallback(() => {
    anim.current?.stop()
    anim.current = null
    if (wheelTimer.current) clearTimeout(wheelTimer.current)
    wheelTimer.current = null
    wheelTarget.current = null
    tracking.current = false
    activity.set(0)
    drag.current = null
  }, [activity])

  /** Accept an option: update the value, notify, tick the phone. */
  const publish = useCallback((index: number) => {
    const { options, disabled, controlled, onValueChange, haptics } = latest.current
    const option = options[index]
    if (!option || option.disabled || disabled || index === requested.current) return
    requested.current = index
    if (!controlled) setInternal(option.value)
    onValueChange?.(option.value)
    if (haptics && tracking.current) navigator.vibrate?.(4)
  }, [])

  const nearest = useCallback((at: number) => {
    let best = -1
    latest.current.options.forEach((o, i) => {
      if (!o.disabled && (best < 0 || Math.abs(i - at) < Math.abs(best - at))) best = i
    })
    return best
  }, [])

  const select = useCallback(
    (index: number, keyboard = false) => {
      const option = latest.current.options[index]
      if (!option || option.disabled || latest.current.disabled) return
      stop()
      publish(index)
      settle(index, keyboard)
      if (keyboard) buttons.current.get(option.value)?.focus({ preventScroll: true })
    },
    [publish, settle, stop],
  )

  // A value changed from outside (controlled, or options changed): glide to it.
  useLayoutEffect(() => {
    if (selectedIndex === requested.current && measured.current) return
    stop()
    requested.current = selectedIndex
    settle(selectedIndex, !measured.current)
  }, [selectedIndex, settle, stop])

  useLayoutEffect(measureFrame, [measureFrame])

  // While a gesture moves the dial, every crossed detent becomes the value in order.
  useEffect(
    () =>
      position.on("change", (at) => {
        if (!tracking.current) return
        const next = nearest(at)
        const from = requested.current
        if (next < 0 || next === from) return
        const step = next > from ? 1 : -1
        for (let i = from + step; step > 0 ? i <= next : i >= next; i += step) publish(i)
      }),
    [nearest, position, publish],
  )

  // Wheel and trackpad follow the delta directly, then snap after a short pause.
  useEffect(() => {
    const element = root.current
    if (!element) return
    const wheel = (event: WheelEvent) => {
      const { options, disabled, horizontal, spacing, reduced } = latest.current
      if (disabled || event.ctrlKey || drag.current?.moved) return
      const useX = Math.abs(event.deltaX) > Math.abs(event.deltaY)
      if (!horizontal && useX) return
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? (horizontal ? element.clientWidth : element.clientHeight) : 1
      const delta = (horizontal && useX ? event.deltaX : event.deltaY) * unit
      const enabled = options.flatMap((o, i) => (o.disabled ? [] : [i]))
      if (!delta || !enabled.length) return
      const first = enabled[0]
      const last = enabled[enabled.length - 1]
      const from = wheelTarget.current ?? position.get()
      // At either end, give the wheel back to the page.
      if ((from <= first && delta < 0) || (from >= last && delta > 0)) return
      event.preventDefault()
      if (wheelTimer.current) clearTimeout(wheelTimer.current)
      if (reduced) {
        const at = enabled.indexOf(requested.current)
        select(enabled[clamp(at + Math.sign(delta), 0, enabled.length - 1)], true)
        return
      }
      if (wheelTarget.current === null) anim.current?.stop()
      tracking.current = true
      activity.set(1)
      const next = clamp(from + delta / spacing, first, last)
      wheelTarget.current = next
      position.set(next)
      wheelTimer.current = setTimeout(() => {
        wheelTimer.current = null
        wheelTarget.current = null
        settle(nearest(next))
      }, WHEEL_SETTLE_MS)
    }
    element.addEventListener("wheel", wheel, { passive: false })
    return () => {
      element.removeEventListener("wheel", wheel)
      stop()
    }
  }, [activity, nearest, position, select, settle, stop])

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    props.onKeyDown?.(event)
    if (event.defaultPrevented || disabled) return
    const enabled = options.flatMap((o, i) => (o.disabled ? [] : [i]))
    if (!enabled.length) return
    const at = Math.max(0, enabled.indexOf(requested.current))
    const jumps: Record<string, number> = {
      ArrowDown: event.shiftKey ? 5 : 1,
      ArrowRight: event.shiftKey ? 5 : 1,
      ArrowUp: event.shiftKey ? -5 : -1,
      ArrowLeft: event.shiftKey ? -5 : -1,
      PageDown: 5,
      PageUp: -5,
      Home: -Infinity,
      End: Infinity,
    }
    if (!(event.key in jumps)) return
    event.preventDefault()
    select(enabled[clamp(at + jumps[event.key], 0, enabled.length - 1)], true)
  }

  const release = (event: React.PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const current = drag.current
    if (!current || current.id !== event.pointerId) return
    drag.current = null
    if (root.current?.hasPointerCapture(event.pointerId)) root.current.releasePointerCapture(event.pointerId)
    if (!current.moved) return
    suppressClick.current = true
    if (cancelled) return settle(requested.current)
    // A flick coasts a few detents before the spring catches it.
    const velocity = performance.now() - current.time > 100 ? 0 : current.velocity
    settle(nearest(position.get() + (reduced ? 0 : velocity * COAST)))
  }

  return (
    <div
      {...props}
      ref={root}
      role="radiogroup"
      aria-label={label}
      aria-describedby={hintId}
      aria-disabled={disabled || undefined}
      aria-orientation={horizontal ? "horizontal" : "vertical"}
      data-side={side}
      className={cn("relative w-full min-w-0 cursor-grab overflow-hidden select-none active:cursor-grabbing", disabled && "cursor-default opacity-50", className)}
      style={{
        touchAction: horizontal ? "pan-y pinch-zoom" : "pan-x pinch-zoom",
        height,
        maskImage: `linear-gradient(to ${horizontal ? "right" : "bottom"}, transparent, black 12%, black 88%, transparent)`,
        ...style,
      }}
      onKeyDown={onKeyDown}
      onPointerDown={(event) => {
        props.onPointerDown?.(event)
        if (event.defaultPrevented || disabled || event.button !== 0 || !event.isPrimary) return
        stop()
        suppressClick.current = false
        const coordinate = horizontal ? event.clientX : event.clientY
        drag.current = { id: event.pointerId, start: coordinate, from: position.get(), last: coordinate, time: performance.now(), velocity: 0, moved: false }
      }}
      onPointerMove={(event) => {
        props.onPointerMove?.(event)
        const current = drag.current
        if (!current || current.id !== event.pointerId) return
        const coordinate = horizontal ? event.clientX : event.clientY
        const delta = coordinate - current.start
        if (!current.moved && Math.abs(delta) < 6) return
        current.moved = true
        tracking.current = true
        activity.set(reduced ? 0 : 1)
        root.current?.setPointerCapture(event.pointerId)
        const now = performance.now()
        const elapsed = Math.max(8, now - current.time)
        // Smoothed velocity in options per second.
        current.velocity = current.velocity * 0.35 + (((current.last - coordinate) / spacing / elapsed) * 1000) * 0.65
        current.last = coordinate
        current.time = now
        const next = clamp(current.from - delta / spacing, 0, Math.max(0, options.length - 1))
        position.set(reduced ? Math.round(next) : next)
      }}
      onPointerUp={(event) => {
        props.onPointerUp?.(event)
        release(event, false)
      }}
      onPointerCancel={(event) => release(event, true)}
      onLostPointerCapture={(event) => release(event, true)}
      onClickCapture={(event) => {
        // A drag that ends on an option must not also click it.
        if (suppressClick.current && event.detail > 0) {
          event.preventDefault()
          event.stopPropagation()
          suppressClick.current = false
        }
      }}
    >
      <span id={hintId} className="sr-only">
        Drag {horizontal ? "sideways" : "up or down"} or scroll to choose. Arrow keys move, Home and End jump.
      </span>
      {name && <input type="hidden" name={name} value={selected?.value ?? ""} disabled={disabled} />}
      {mounted && ticks && options.flatMap((_, i) => (i < options.length - 1 ? [i, i + 0.5] : [i])).map((mark) => <Tick key={mark} at={mark} position={position} g={g} accent={accent} />)}
      {mounted &&
        options.map((option, index) => (
        <ArcOption
          key={option.value}
          option={option}
          index={index}
          position={position}
          g={g}
          selected={index === selectedIndex}
          disabled={disabled}
          accent={accent}
          setRef={(el) => {
            if (el) buttons.current.set(option.value, el)
            else buttons.current.delete(option.value)
          }}
          onSelect={() => select(index)}
        />
      ))}
      {mounted && selected && <Brackets width={frameWidth} spread={spread} g={g} accent={accent} />}
      {!options.length && <span className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">No options</span>}
    </div>
  )
}
