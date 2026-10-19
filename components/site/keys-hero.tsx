"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type Key = "cmd" | "c" | "v"
type State = { down: Key[]; lit: number }

/** ⌘+C lights "Copy.", ⌘+V lights "Paste.", then "Ship." — on a loop. */
const SEQUENCE: [State, number][] = [
  [{ down: ["cmd"], lit: 0 }, 300],
  [{ down: ["cmd", "c"], lit: 1 }, 450],
  [{ down: ["cmd"], lit: 1 }, 350],
  [{ down: ["cmd", "v"], lit: 2 }, 450],
  [{ down: [], lit: 2 }, 250],
  [{ down: [], lit: 3 }, 2600],
  [{ down: [], lit: 0 }, 700],
]

const KEYS: { id: Key; label: string }[] = [
  { id: "cmd", label: "⌘" },
  { id: "c", label: "C" },
  { id: "v", label: "V" },
]

export function KeysHero() {
  const [state, setState] = useState<State>({ down: [], lit: 3 })

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let step = 0
    let timer: ReturnType<typeof setTimeout>
    const next = () => {
      const [value, delay] = SEQUENCE[step]
      setState(value)
      step = (step + 1) % SEQUENCE.length
      timer = setTimeout(next, delay)
    }
    timer = setTimeout(next, 600)
    return () => clearTimeout(timer)
  }, [])

  const word = (index: number) =>
    cn("inline-block transition-[opacity,filter] duration-500", state.lit >= index ? "opacity-100 blur-0" : "opacity-20 blur-[2px]")

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex gap-3 sm:gap-4" aria-hidden>
        {KEYS.map((key) => (
          <span key={key.id} className={cn("keycap size-16 text-2xl sm:size-24 sm:text-4xl", state.down.includes(key.id) && "keycap-down")}>
            {key.label}
          </span>
        ))}
      </div>
      <h1 className="text-5xl font-normal tracking-[-0.055em] sm:text-7xl lg:text-8xl">
        <span className={word(1)}>Copy.</span> <span className={word(2)}>Paste.</span>{" "}
        <span className={cn(word(3), "ember-text pr-[0.06em] font-serif font-light tracking-[-0.02em] italic")}>Ship.</span>
      </h1>
    </div>
  )
}
