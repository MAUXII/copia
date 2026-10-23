"use client"

import { useEffect, useState } from "react"
import { InvertedPerspectiveCarousel, type InvertedPerspectiveCarouselProps } from "./inverted-perspective-carousel"

const image = (file: string, alt: string) => ({ src: `/demo/inverted-perspective-carousel/${file}.webp`, alt })

const IMAGES = [
  image("expressive-eyes-close-up", "Expressive eyes, close up"),
  image("abstract-black-and-white", "Abstract black and white"),
  image("focused-red-portrait", "Focused red portrait"),
  image("blurred-monochrome-portrait", "Blurred monochrome portrait"),
  image("spiral-glow-abstract", "Spiral glow"),
  image("dramatic-dual-portrait", "Dramatic dual portrait"),
  image("abstract-face-illustration", "Minimal face illustration"),
  image("freckled-beauty-close-up", "Freckles, close up"),
  image("ethereal-dancer-motion", "Dancer in motion"),
]

type DemoProps = Pick<InvertedPerspectiveCarouselProps, "rotate" | "depth" | "spaceBetween" | "autoplay" | "slideShadows" | "reflection">

/** Customizer values flow into the carousel. */
export default function Demo({ autoplay = 1800, ...props }: DemoProps) {
  // Slides scale with the space, so a narrow preview still shows the side slides turning.
  const [size, setSize] = useState(300)
  useEffect(() => {
    const fit = () => setSize(Math.round(Math.max(150, Math.min(300, window.innerWidth * 0.3, window.innerHeight * 0.5))))
    fit()
    window.addEventListener("resize", fit)
    return () => window.removeEventListener("resize", fit)
  }, [])
  return (
    <div className="grid flex-1 place-items-center overflow-hidden px-5 py-10">
      {/* The recorder's cursor sits over it, so the demo keeps playing on hover. */}
      <InvertedPerspectiveCarousel images={IMAGES} size={size} autoplay={autoplay} pauseOnHover={false} className="max-w-4xl" {...props} />
    </div>
  )
}
