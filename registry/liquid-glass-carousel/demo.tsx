"use client"

import { LiquidGlassCarousel, type LiquidGlassCarouselProps, type LiquidGlassItem } from "./liquid-glass-carousel"

const photo = (file: string, title: string): LiquidGlassItem => ({ src: `/demo/liquid-glass-carousel/${file}`, title })

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

/** Customizer values (lensSize, dispersion, radius, gap, autoplay) flow into the carousel. */
export default function Demo({ autoplay = 1.8, ...props }: Pick<LiquidGlassCarouselProps, "lensSize" | "dispersion" | "radius" | "gap" | "autoplay">) {
  return (
    <div className="relative min-h-[560px] flex-1">
      <LiquidGlassCarousel items={ITEMS} autoplay={autoplay} className="absolute inset-0" {...props} />
    </div>
  )
}
