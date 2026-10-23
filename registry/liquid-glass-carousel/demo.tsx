"use client"

import { useEffect, useRef, useState } from "react"
import { LiquidGlassCarousel, type LiquidGlassCarouselItem } from "./liquid-glass-carousel"

const photo = (file: string, title: string): LiquidGlassCarouselItem => ({ src: `/demo/liquid-glass-carousel/${file}`, title })

const ITEMS = [
  photo("crimson-contemplation.webp", "Crimson Contemplation"),
  photo("artistic-orchid.webp", "Artistic Orchid"),
  photo("intense-eye.webp", "Intense Eye"),
  photo("elegant-red-portrait.webp", "Elegant Red"),
  photo("white-flowers-on-black.webp", "White Flowers"),
  photo("metallic-droplets.webp", "Metallic Droplets"),
  photo("red-light-portrait.webp", "Red Light"),
  photo("close-up-eye.webp", "Close-up"),
  photo("fiery-profile.webp", "Fiery Profile"),
]

type DemoProps = { dispersion?: number; ring?: number; rotation?: number; gap?: number; autoplay?: number; lensColor?: string }

/** Any CSS colour (rgb, oklch…) to #rrggbb, by painting one pixel. */
const toHex = (color: string) => {
  const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true })
  if (!ctx) return "#ffffff"
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`
}

/** The page's theme colours as hex (the carousel's WebGL clear colour needs one), updated when the theme flips. */
function useThemeColors(ref: React.RefObject<HTMLElement | null>) {
  const [colors, setColors] = useState({ background: "#ffffff", foreground: "#111111" })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const read = () => {
      const style = getComputedStyle(el)
      const next = { background: toHex(style.backgroundColor), foreground: toHex(style.color) }
      setColors((c) => (c.background === next.background && c.foreground === next.foreground ? c : next))
    }
    read()
    // Theme classes can change on any ancestor (the page or the viewer's preview).
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"], subtree: true })
    return () => observer.disconnect()
  }, [ref])
  return colors
}

/** Customizer values flow into the lens (dispersion, ring, rotation), the row (gap) and autoplay. */
export default function Demo({ dispersion = 11, ring = 6, rotation = 65, gap = 12, autoplay = 1.8, lensColor = "#009dff" }: DemoProps) {
  const root = useRef<HTMLDivElement>(null)
  const theme = useThemeColors(root)
  return (
    <div ref={root} className="relative min-h-[560px] flex-1 bg-background text-foreground">
      <LiquidGlassCarousel items={ITEMS} background={theme.background} foreground={theme.foreground} gap={gap} autoplay={autoplay} lens={{ dispersion, blueRing: ring, rotation }} lensColor={lensColor} className="absolute inset-0" />
    </div>
  )
}
