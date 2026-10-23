"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

type Hsv = { h: number; s: number; v: number }

const PRESETS = ["#ffffff", "#0a0a0a", "#ff4d1c", "#ff9f0a", "#30d158", "#0a84ff", "#455ce9", "#bf5af2", "#ff375f"]

function hexToHsv(hex: string): Hsv {
  const n = parseInt(hex.slice(1), 16)
  const r = ((n >> 16) & 255) / 255
  const g = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255
  const max = Math.max(r, g, b)
  const d = max - Math.min(r, g, b)
  let h = 0
  if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return { h: (h * 60 + 360) % 360, s: max ? d / max : 0, v: max }
}

function hsvToHex({ h, s, v }: Hsv) {
  const f = (n: number) => {
    const k = (n + h / 60) % 6
    return Math.round((v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255)
  }
  return `#${[f(5), f(3), f(1)].map((c) => c.toString(16).padStart(2, "0")).join("")}`
}

/** Drag inside an element and get the pointer position as 0–1 fractions. */
function useDrag(onMove: (x: number, y: number) => void) {
  return (e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget
    const move = (ev: { clientX: number; clientY: number }) => {
      const r = el.getBoundingClientRect()
      onMove(Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width)), Math.min(1, Math.max(0, (ev.clientY - r.top) / r.height)))
    }
    move(e)
    el.setPointerCapture(e.pointerId)
    const up = () => {
      el.removeEventListener("pointermove", move)
      el.removeEventListener("pointerup", up)
    }
    el.addEventListener("pointermove", move)
    el.addEventListener("pointerup", up)
  }
}

/**
 * Colour control for the Props Customizer: a swatch with the hex beside it;
 * click to open a saturation/brightness field, a hue strip, presets and a
 * hex field.
 */
export function ColorPicker({ value, onChange, label }: { value: string; onChange: (hex: string) => void; label: string }) {
  const [open, setOpen] = useState(false)
  const [hsv, setHsv] = useState(() => hexToHsv(value))
  const [draft, setDraft] = useState(value)
  const root = useRef<HTMLDivElement>(null)

  // Follow outside changes (Reset) without losing the hue of a grey while dragging.
  useEffect(() => {
    if (hsvToHex(hsv) !== value.toLowerCase()) setHsv(hexToHsv(value))
    setDraft(value)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only an outside value change should resync
  }, [value])

  useEffect(() => {
    if (!open) return
    const close = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false)
    // Captured first, so Escape closes only the picker, not the props panel around it.
    const esc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      e.stopPropagation()
      setOpen(false)
    }
    window.addEventListener("pointerdown", close)
    window.addEventListener("keydown", esc, true)
    return () => {
      window.removeEventListener("pointerdown", close)
      window.removeEventListener("keydown", esc, true)
    }
  }, [open])

  const set = (next: Hsv) => {
    setHsv(next)
    onChange(hsvToHex(next))
  }
  const field = useDrag((x, y) => set({ ...hsv, s: x, v: 1 - y }))
  const hue = useDrag((x) => set({ ...hsv, h: x * 359.9 }))

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-label={`${label}: ${value}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-full items-center gap-2.5 rounded-lg bg-white/[0.05] px-1.5 text-left transition-colors hover:bg-white/[0.08]"
      >
        <span className="size-5 rounded-md ring-1 ring-white/15" style={{ background: value }} />
        <span className="font-mono text-xs text-[#ffc48a] uppercase">{value}</span>
      </button>

      {open && (
        <div className="absolute top-10 right-0 left-0 z-20 flex flex-col gap-3 rounded-xl bg-neutral-900 p-3 shadow-2xl ring-1 ring-white/10">
          <div
            role="slider"
            aria-label="Saturation and brightness"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(hsv.s * 100)}
            aria-valuetext={`${value}, saturation ${Math.round(hsv.s * 100)}%, brightness ${Math.round(hsv.v * 100)}%`}
            tabIndex={0}
            onPointerDown={field}
            onKeyDown={(e) => {
              const step = e.shiftKey ? 0.1 : 0.02
              const moves: Record<string, Partial<Hsv>> = {
                ArrowLeft: { s: Math.max(0, hsv.s - step) },
                ArrowRight: { s: Math.min(1, hsv.s + step) },
                ArrowUp: { v: Math.min(1, hsv.v + step) },
                ArrowDown: { v: Math.max(0, hsv.v - step) },
              }
              if (!moves[e.key]) return
              e.preventDefault()
              set({ ...hsv, ...moves[e.key] })
            }}
            className="relative h-32 cursor-crosshair touch-none rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsv.h} 100% 50%))` }}
          >
            <span
              className="pointer-events-none absolute size-3.5 -translate-1/2 rounded-full ring-2 ring-white shadow"
              style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, background: value }}
            />
          </div>
          <div
            role="slider"
            aria-label="Hue"
            aria-valuemin={0}
            aria-valuemax={360}
            aria-valuenow={Math.round(hsv.h)}
            tabIndex={0}
            onPointerDown={hue}
            onKeyDown={(e) => {
              if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return
              e.preventDefault()
              set({ ...hsv, h: (hsv.h + (e.key === "ArrowRight" ? 1 : -1) * (e.shiftKey ? 15 : 3) + 360) % 360 })
            }}
            className="relative h-3 cursor-ew-resize touch-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            style={{ background: "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)" }}
          >
            <span className="pointer-events-none absolute top-1/2 size-3.5 -translate-1/2 rounded-full ring-2 ring-white shadow" style={{ left: `${(hsv.h / 360) * 100}%`, background: `hsl(${hsv.h} 100% 50%)` }} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                aria-label={preset}
                onClick={() => {
                  setHsv(hexToHsv(preset))
                  onChange(preset)
                }}
                className={cn("size-5 rounded-md ring-1 ring-white/15 transition-transform hover:scale-110", preset === value.toLowerCase() && "ring-2 ring-white")}
                style={{ background: preset }}
              />
            ))}
          </div>
          <input
            aria-label="Hex colour"
            value={draft}
            spellCheck={false}
            onChange={(e) => {
              const next = e.target.value.trim()
              setDraft(next)
              const hex = next.startsWith("#") ? next : `#${next}`
              if (/^#[0-9a-f]{6}$/i.test(hex)) {
                setHsv(hexToHsv(hex))
                onChange(hex.toLowerCase())
              }
            }}
            className="h-8 rounded-lg bg-white/[0.06] px-2.5 font-mono text-xs text-neutral-200 uppercase outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          />
        </div>
      )}
    </div>
  )
}
