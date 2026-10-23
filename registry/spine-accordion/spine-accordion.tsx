"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export type SpineAccordionItem = {
  /** Set along the spine; also names the panel. */
  title: string
  /** Picture revealed when the panel opens. */
  image: string
  /** At the far end of the spine, e.g. a year. */
  meta?: string
}

export type SpineAccordionProps = Omit<React.ComponentProps<"section">, "children" | "onChange"> & {
  items: SpineAccordionItem[]
  /** Open panel when controlled. */
  index?: number
  /** Open panel on mount when uncontrolled. */
  defaultIndex?: number
  onIndexChange?: (index: number) => void
  /** Thickness of a closed spine (any CSS length); also the open picture's inset. */
  spine?: string
  /** Number the spines (01, 02…) above their titles. */
  numbered?: boolean
  /** Open the next panel every N ms; hover, focus and touch pause it. 0 turns it off. */
  autoplay?: number
  /** "auto" stacks below a 48rem-wide container; "horizontal" and "vertical" pin a layout. */
  orientation?: "auto" | "horizontal" | "vertical"
}

// Crafter UI's curve and timing: a long, soft settle.
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"

// Copia: full class sets per layout (Tailwind needs literal class names, and the row and stack
// placements set the same properties, so they cannot simply be layered).
const ROW = {
  list: "flex-row overflow-y-visible",
  panel: "border-r",
  picture: "inset-y-3 right-3 left-(--spine)",
  spine: "inset-y-4 left-4 flex-col-reverse gap-0",
  title: "rotate-180 overflow-visible [writing-mode:vertical-rl]",
  titleText: "text-lg @5xl:text-xl",
  meta: "rotate-180 text-sm [writing-mode:vertical-rl]",
}
const STACK = {
  list: "flex-col overflow-y-auto",
  panel: "border-b",
  picture: "inset-x-3 top-(--spine) bottom-3",
  spine: "inset-x-4 top-4 gap-3",
  title: "truncate",
  titleText: "text-base",
  meta: "text-xs",
}
const AUTO = {
  list: "flex-col overflow-y-auto @3xl:flex-row @3xl:overflow-y-visible",
  panel: "border-b @3xl:border-r @3xl:border-b-0",
  picture: "inset-x-3 top-(--spine) bottom-3 @3xl:inset-x-auto @3xl:inset-y-3 @3xl:right-3 @3xl:left-(--spine)",
  spine: "inset-x-4 top-4 gap-3 @3xl:inset-x-auto @3xl:inset-y-4 @3xl:left-4 @3xl:flex-col-reverse @3xl:gap-0",
  title: "truncate @3xl:rotate-180 @3xl:overflow-visible @3xl:[writing-mode:vertical-rl]",
  titleText: "text-base @3xl:text-lg @5xl:text-xl",
  meta: "text-xs @3xl:rotate-180 @3xl:text-sm @3xl:[writing-mode:vertical-rl]",
}
const LAYOUTS = { auto: AUTO, horizontal: ROW, vertical: STACK }

/**
 * A shelf of work opened one piece at a time. Closed, every piece is a spine:
 * a thin column with its title set sideways like the back of a book. Point,
 * tap, focus or arrow-key to one and it unfurls into a framed picture while
 * the rest close back. The only animated length is flex-basis, so it fits any
 * number of pieces, and it stacks into rows in a narrow container.
 */
export function SpineAccordion({
  items,
  index,
  defaultIndex = 0,
  onIndexChange,
  spine = "4rem",
  numbered = false,
  autoplay = 0,
  orientation = "auto",
  className,
  style,
  ...props
}: SpineAccordionProps) {
  const [internal, setInternal] = useState(defaultIndex)
  const [paused, setPaused] = useState(false)
  const open = index ?? internal
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const L = LAYOUTS[orientation]

  const select = useCallback(
    (next: number) => {
      if (next === open) return
      if (index === undefined) setInternal(next)
      onIndexChange?.(next)
    },
    [index, open, onIndexChange],
  )

  // Copia: autoplay walks the shelf while nobody is on it.
  useEffect(() => {
    if (!autoplay || paused || items.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = setTimeout(() => select((open + 1) % items.length), autoplay)
    return () => clearTimeout(id)
  }, [autoplay, paused, open, items.length, select])

  // Copia: arrow keys move along the shelf (either axis, since it can stack), Home and End jump.
  const onKeyDown = (event: React.KeyboardEvent) => {
    const moves: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1, Home: -Infinity, End: Infinity }
    if (!(event.key in moves)) return
    event.preventDefault()
    const step = moves[event.key]
    const next = Number.isFinite(step) ? (open + step + items.length) % items.length : step < 0 ? 0 : items.length - 1
    buttons.current[next]?.focus()
  }

  return (
    // Sized by its container, not the viewport, so it stacks off its own width.
    <section
      {...props}
      aria-roledescription="gallery"
      onKeyDown={onKeyDown}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setPaused(false)}
      className={cn("@container relative h-full min-h-[24rem] w-full overflow-hidden bg-background text-foreground select-none", className)}
      style={{ "--spine": spine, ...style } as React.CSSProperties}
    >
      <div className={cn("flex h-full w-full", L.list)}>
        {items.map((item, i) => {
          const isOpen = i === open
          return (
            <button
              key={item.title}
              ref={(el) => {
                buttons.current[i] = el
              }}
              type="button"
              aria-expanded={isOpen}
              aria-label={item.meta ? `${item.title}, ${item.meta}` : item.title}
              tabIndex={isOpen ? 0 : -1}
              onClick={() => select(i)}
              onFocus={() => select(i)}
              onPointerEnter={(event) => {
                // Hover opens only under a mouse; on touch the tap already selects.
                if (event.pointerType === "mouse") select(i)
              }}
              style={{ flexBasis: isOpen ? "100%" : "var(--spine)", transitionTimingFunction: EASE }}
              className={cn(
                "relative min-h-(--spine) min-w-(--spine) shrink cursor-pointer border-border text-left outline-none transition-[flex-basis] duration-700 last:border-0",
                "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foreground motion-reduce:transition-none",
                L.panel,
              )}
            >
              {/* Mounted in every panel and only transparent while closed, so opening cross-fades a decoded picture. */}
              <span
                className={cn(
                  "absolute block overflow-hidden bg-muted transition-opacity duration-700 motion-reduce:transition-none",
                  L.picture,
                  isOpen ? "opacity-100" : "opacity-0",
                )}
              >
                {/* Copia: the picture settles from a slight zoom as the panel opens. */}
                {/* eslint-disable-next-line @next/next/no-img-element -- plain img keeps the component framework-agnostic */}
                <img
                  src={item.image}
                  alt=""
                  draggable={false}
                  className="size-full object-cover transition-[scale] duration-[1400ms] motion-reduce:transition-none"
                  style={{ scale: isOpen ? "1" : "1.12", transitionTimingFunction: EASE }}
                />
              </span>

              {/* The spine: writing-mode turns the text without a measured rotate box. */}
              <span
                className={cn(
                  "absolute flex items-start justify-between overflow-hidden transition-colors duration-500 motion-reduce:transition-none",
                  L.spine,
                  isOpen ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <span className={cn("flex items-baseline gap-3", L.title)}>
                  <span className={cn("font-medium tracking-tight", L.titleText)}>{item.title}</span>
                  {numbered && <span className="font-mono text-[11px] tabular-nums opacity-60">{String(i + 1).padStart(2, "0")}</span>}
                </span>
                {item.meta && (
                  <span
                    className={cn(
                      "shrink-0 tabular-nums transition-opacity duration-500 motion-reduce:transition-none",
                      L.meta,
                      isOpen ? "opacity-100" : "opacity-0",
                    )}
                  >
                    {item.meta}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
