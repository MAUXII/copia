"use client"

import { SpineAccordion, type SpineAccordionProps } from "./spine-accordion"

const photo = (file: string) => `/demo/spine-accordion/${file}.webp`

const ITEMS = [
  { title: "Northern Lights", image: photo("northern-lights"), meta: "2021" },
  { title: "Desert Bloom", image: photo("desert-bloom"), meta: "2022" },
  { title: "Coastal Drift", image: photo("coastal-ruins"), meta: "2023" },
  { title: "Urban Pulse", image: photo("twilight-city"), meta: "2024" },
  { title: "Night Dunes", image: photo("night-desert"), meta: "2025" },
]

type DemoProps = Pick<SpineAccordionProps, "numbered" | "autoplay" | "orientation"> & { spine?: number }

/** Customizer values: spine thickness (rem), numbering, autoplay and layout (horizontal by default, even in the narrow preview). */
export default function Demo({ spine = 4, autoplay = 1600, numbered = true, orientation = "horizontal" }: DemoProps) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <SpineAccordion items={ITEMS} defaultIndex={2} spine={`${spine}rem`} autoplay={autoplay} numbered={numbered} orientation={orientation} className="h-[min(30rem,calc(100dvh-3rem))] min-h-0 max-w-5xl" />
    </div>
  )
}
