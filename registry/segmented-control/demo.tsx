"use client"

import { LayoutGrid, List, Rows3 } from "lucide-react"
import { useEffect, useState } from "react"
import { SegmentedControl, type SegmentedControlProps } from "./segmented-control"

const VIEWS = [
  { value: "grid", label: "Grid", icon: <LayoutGrid /> },
  { value: "list", label: "List", icon: <List /> },
  { value: "rows", label: "Rows", icon: <Rows3 /> },
]
const PERIODS = ["Day", "Week", "Month", "Year"].map((p) => ({ value: p.toLowerCase(), label: p }))

/** Two controls that step through their options on their own until you touch one. */
export default function Demo({ size = "md" }: Pick<SegmentedControlProps, "size">) {
  const [view, setView] = useState("grid")
  const [period, setPeriod] = useState("week")
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (touched || matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let step = 0
    const id = setInterval(() => {
      step++
      setPeriod(PERIODS[(step + 1) % PERIODS.length].value)
      if (step % 2 === 0) setView(VIEWS[(step / 2) % VIEWS.length].value)
    }, 900)
    return () => clearInterval(id)
  }, [touched])

  return (
    <div className="grid flex-1 place-items-center p-6" onPointerDown={() => setTouched(true)} onKeyDown={() => setTouched(true)}>
      <div className="flex flex-col items-center gap-5">
        <SegmentedControl label="Period" options={PERIODS} value={period} onValueChange={setPeriod} size={size} />
        <SegmentedControl label="View" options={VIEWS} value={view} onValueChange={setView} size={size} />
      </div>
    </div>
  )
}
