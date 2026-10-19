import { cn } from "@/lib/utils"

type Direction = "top" | "bottom" | "left" | "right"

export type ProgressiveBlurProps = React.ComponentProps<"div"> & {
  /** Edge the blur grows toward. */
  direction?: Direction
  /** Stacked blur layers. 6–10 looks smooth; more costs performance. */
  layers?: number
  /** Blur radius at the edge, in pixels. */
  maxBlur?: number
  /** How blur grows across the layers. "exponential" reads more like iOS. */
  curve?: "linear" | "exponential"
  /** Fade toward the background color on top of the blur, hiding banding on busy content. */
  tint?: boolean
  /** Pin to the viewport edge instead of the nearest `relative` parent (page-wide effect). */
  fixed?: boolean
  /**
   * Stick to the top or bottom edge of whatever scrolls (the page or a scrolling
   * parent) while content moves under it. Place it first (top) or last (bottom)
   * inside the scrolling content.
   */
  sticky?: boolean
}

const GRADIENT_DIRECTION: Record<Direction, string> = {
  top: "to top",
  bottom: "to bottom",
  left: "to left",
  right: "to right",
}

const EDGE_CLASS: Record<Direction, string> = {
  top: "inset-x-0 top-0 h-1/3",
  bottom: "inset-x-0 bottom-0 h-1/3",
  left: "inset-y-0 left-0 w-1/3",
  right: "inset-y-0 right-0 w-1/3",
}

/**
 * Blur that grows smoothly toward an edge. `backdrop-filter` is uniform per
 * element, so N layers are stacked: layer i blurs more and is masked to a band
 * that overlaps its neighbours, which the eye reads as one continuous ramp.
 * Place it inside a `relative` container, or pass `fixed` to blur the page edges
 * while content scrolls under them. Size it with `className` (e.g. `h-40`).
 */
export function ProgressiveBlur({
  direction = "bottom",
  layers = 8,
  maxBlur = 24,
  curve = "exponential",
  tint = false,
  fixed = false,
  sticky = false,
  className,
  style,
  ...props
}: ProgressiveBlurProps) {
  const gradient = GRADIENT_DIRECTION[direction]
  const segment = 1 / (layers + 1)
  const pct = (n: number) => `${(n * segment * 100).toFixed(3)}%`

  const blur = (
    <div aria-hidden className={cn("pointer-events-none z-10", fixed ? "fixed" : "absolute", EDGE_CLASS[direction], className)} style={style} {...props}>
      {Array.from({ length: layers }, (_, i) => {
        const t = (i + 1) / layers
        const blur = maxBlur * (curve === "exponential" ? t * t : t)
        const mask = `linear-gradient(${gradient}, transparent ${pct(i)}, black ${pct(i + 1)}, black ${pct(i + 2)}, transparent ${pct(i + 3)})`
        return (
          <div
            key={i}
            className="absolute inset-0"
            style={{ backdropFilter: `blur(${blur.toFixed(2)}px)`, WebkitBackdropFilter: `blur(${blur.toFixed(2)}px)`, maskImage: mask, WebkitMaskImage: mask }}
          />
        )
      })}
      {tint && <div className="absolute inset-0" style={{ background: `linear-gradient(${gradient}, transparent 20%, var(--background))` }} />}
    </div>
  )

  // A zero-height sticky wrapper keeps the blur glued to the scroller's edge without taking space.
  if (sticky && (direction === "top" || direction === "bottom")) {
    return <div className={cn("pointer-events-none sticky z-10 h-0", direction === "top" ? "top-0" : "bottom-0")}>{blur}</div>
  }
  return blur
}
