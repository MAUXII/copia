"use client"

import { useEffect, useState } from "react"
import { DynamicIsland, type DynamicIslandProps, type IslandView } from "./dynamic-island"

const VIEWS: IslandView[] = ["idle", "ring", "silent", "timer", "recording", "call", "music", "notification"]

type DemoProps = Pick<DynamicIslandProps, "timerSeconds"> & { alertColor?: string; acceptColor?: string; timerColor?: string; musicColor?: string; notificationColor?: string }

/** Customizer values: the timer length and the activity colours. */
export default function Demo({ timerSeconds, alertColor, acceptColor, timerColor, musicColor, notificationColor }: DemoProps) {
  const colors = { alert: alertColor, accept: acceptColor, timer: timerColor, music: musicColor, notification: notificationColor }
  // Unset controls fall back to Apple's colours.
  const props = { timerSeconds, colors: Object.fromEntries(Object.entries(colors).filter(([, v]) => v)) }
  const [index, setIndex] = useState(1)
  const [auto, setAuto] = useState(true)

  useEffect(() => {
    if (!auto) return
    const id = setInterval(() => setIndex((i) => (i + 1) % VIEWS.length), 1400)
    return () => clearInterval(id)
  }, [auto])

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-16 p-6">
      <DynamicIsland {...props} view={VIEWS[index]} />
      <div className="flex flex-wrap justify-center gap-1.5">
        {VIEWS.map((view, i) => (
          <button
            key={view}
            type="button"
            onClick={() => {
              setAuto(false)
              setIndex(i)
            }}
            className={`rounded-full border px-2.5 py-1 text-[11px] capitalize transition-colors ${i === index ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
          >
            {view}
          </button>
        ))}
      </div>
    </div>
  )
}
