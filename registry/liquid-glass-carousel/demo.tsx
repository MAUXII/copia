"use client"

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

type DemoProps = { dispersion?: number; ring?: number; rotation?: number; gap?: number; autoplay?: number }

/** Customizer values flow into the lens (dispersion, ring, rotation), the row (gap) and autoplay. */
export default function Demo({ dispersion = 11, ring = 6, rotation = 65, gap = 12, autoplay = 1.8 }: DemoProps) {
  return (
    <div className="relative min-h-[560px] flex-1">
      <LiquidGlassCarousel items={ITEMS} gap={gap} autoplay={autoplay} lens={{ dispersion, blueRing: ring, rotation }} className="absolute inset-0" />
    </div>
  )
}
