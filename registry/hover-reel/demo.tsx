"use client"

import { HoverReel, type HoverReelProps } from "./hover-reel"

const shot = (file: string) => `/demo/hover-reel/${file}.webp`

const PROJECTS = [
  { title: "Masar", label: "Trip planning for Oman", image: shot("modern-building-corner") },
  { title: "Wally", label: "A household wallet", image: shot("minimalist-geometric-composition") },
  { title: "TransOcean", label: "Logistics platform", image: shot("monochromatic-staircase") },
  { title: "OCS", label: "Website and design system", image: shot("modern-workspace-setup") },
  { title: "Vitrine", label: "Component library", image: shot("abstract-toroidal-form") },
]

/** Customizer values (width, tilt) flow into the reel. */
export default function Demo(props: Pick<HoverReelProps, "width" | "tilt">) {
  return (
    <div className="flex flex-1 flex-col justify-center py-12">
      <div className="mx-auto w-full max-w-[72rem] px-[clamp(1.25rem,5vw,4rem)]">
        <p className="mb-6 font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">Selected work · 2023–2026</p>
        <HoverReel projects={PROJECTS} {...props} />
      </div>
    </div>
  )
}
