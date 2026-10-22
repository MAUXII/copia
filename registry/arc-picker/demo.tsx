"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { ArcPicker, type ArcPickerProps } from "./arc-picker"

const OPTIONS = [
  "First light",
  "Dawn",
  "Daybreak",
  "Sunrise",
  "Early morning",
  "Morning",
  "Late morning",
  "Midday",
  "Noon",
  "Afternoon",
  "Golden hour",
  "Sunset",
  "Blue hour",
  "Dusk",
  "Twilight",
  "Evening",
  "Nightfall",
  "Night",
  "Late night",
  "Midnight",
].map((label) => ({ value: label.toLowerCase().replace(/ /g, "-"), label }))

// The preview tour: a few steps through the day, until someone touches it.
const TOUR = ["golden-hour", "sunset", "blue-hour", "dusk", "blue-hour", "afternoon", "noon", "golden-hour"]

/** Customizer values (radius, visibleCount, depth, side, ticks) flow into the picker. */
export default function Demo(props: Pick<ArcPickerProps, "radius" | "visibleCount" | "depth" | "side" | "ticks">) {
  const [value, setValue] = useState("golden-hour")
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (touched || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let step = 0
    const id = setInterval(() => setValue(TOUR[++step % TOUR.length]), 650)
    return () => clearInterval(id)
  }, [touched])

  const label = OPTIONS.find((o) => o.value === value)?.label
  // Top and bottom lay the labels side by side, so they need the width.
  const horizontal = props.side === "top" || props.side === "bottom"
  return (
    <div className="grid flex-1 place-items-center px-6 py-16" onPointerDown={() => setTouched(true)} onWheel={() => setTouched(true)} onKeyDown={() => setTouched(true)}>
      <div className={cn("flex w-full flex-col items-center gap-6", horizontal ? "max-w-4xl" : "max-w-md")}>
        <ArcPicker options={OPTIONS} value={value} onValueChange={setValue} aria-label="Time of day" className={horizontal ? undefined : "max-w-xs"} {...props} />
        <p className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
          Time of day · <span className="text-foreground">{label}</span>
        </p>
      </div>
    </div>
  )
}
