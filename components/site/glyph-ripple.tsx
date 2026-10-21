"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

const CELL_W = 14 // px per column
const CELL_H = 18 // px per row
const FONT = '11px "Geist Mono", ui-monospace, monospace'
// Code glyphs. Each cell owns one and swaps it rarely, so the field reads as text, not noise.
const GLYPHS = "abcdefghijklmnopqrstuvwxyz0123456789{}[]()<>/\\=+-*_;:.,'\"|&%$#@!?~^".split("")

// At rest: barely there. Alpha IS brightness on a near-black ground.
const REST_ALPHA = 0.035
const WIND_ALPHA = 0.035 // extra alpha a slow noise gust adds at its peak
const WIND_SCALE = 0.004 // noise frequency (lower = bigger gusts)
const WIND_SPEED = 0.018 // drift, noise units per second: slow
const SWAP_RATE = 0.04 // idle glyph swaps per cell per second (~ one every 25 s)

// Bursts, after the Claude desktop energy grid: a round wavefront ripples out from
// the click, quantized to whole cells, flashes each recruited cell on
// arrival and leaves an afterglow that cools through a discrete ramp.
const SPEED = 30 // cells per second
const RANGE = 48 // cells the front travels before it dies out
const DENSITY = 0.75 // fraction of cells a burst recruits, keeps dark gaps
const JITTER = 0.05 // per-cell arrival scatter, seconds
const HEAD_GAIN = 1.25 // arrival flash strength
const HEAD_DECAY = 9 // arrival flash fade, 1/s: fast, so the lit band stays thin
const BODY_GAIN = 0.06 // faint afterglow behind the ring
const BODY_DECAY = 2.6 // afterglow fade, 1/s: short, so the front reads as a ring
const MAX_AGE = 4 // seconds, past this a burst is dead
const STEPS = 5 // intensity is quantized, never a continuous gradient
const INK_FLOOR = 0.08 // alpha of the lowest ramp step
const INK_CEIL = 0.8 // alpha of the top ramp step
const RAMP_POW = 1.4 // keeps the cool end of the ramp longer
const HOVER_RADIUS = 5 // cells, the cursor wakes a few faint cells
const CALM = 0.45 // how much bursts soften over the headline

const COOL = [235, 228, 220] // low energy: warm white
const HOT = [255, 122, 69] // top energy: Ember

/** Deterministic hash in [0, 1). */
function hash(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return n - Math.floor(n)
}
/** Smooth value noise in [0, 1]. */
function noise(x: number, y: number) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const a = hash(xi, yi)
  const b = hash(xi + 1, yi)
  const c = hash(xi, yi + 1)
  const d = hash(xi + 1, yi + 1)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}

type Burst = { col: number; row: number; start: number; seed: number }

/**
 * A near-invisible field of code glyphs, after the Claude desktop "Landing
 * Texture". At rest it is a dark, slow texture you barely notice; a click sends
 * a round ripple ring that recruits cells, flashes them toward the brand color
 * and lets them cool back down. Listens on the parent so content stays clickable.
 */
export function GlyphRipple({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    const host = canvas?.parentElement
    if (!canvas || !ctx || !host) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const bursts: Burst[] = []
    const pointer = { col: -999, row: -999 }
    let width = 0
    let height = 0
    let cols = 0
    let rows = 0
    let glyphs = new Uint8Array(0) // glyph index per cell
    let flash = new Float32Array(0) // last arrival time per cell, swaps its glyph once
    let frame = 0
    let visible = true
    let last = performance.now()

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cols = Math.ceil(width / CELL_W)
      rows = Math.ceil(height / CELL_H)
      glyphs = new Uint8Array(cols * rows)
      for (let i = 0; i < glyphs.length; i++) glyphs[i] = (Math.random() * GLYPHS.length) | 0
      flash = new Float32Array(cols * rows).fill(-1)
    }

    const draw = (now: number) => {
      const t = now / 1000
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      ctx.clearRect(0, 0, width, height)
      ctx.font = FONT
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.globalCompositeOperation = "lighter"
      for (let i = bursts.length - 1; i >= 0; i--) if (t - bursts[i].start > MAX_AGE) bursts.splice(i, 1)

      const offsetX = (width - cols * CELL_W) / 2 + CELL_W / 2
      const offsetY = (height - rows * CELL_H) / 2 + CELL_H / 2
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = offsetX + col * CELL_W
          const y = offsetY + row * CELL_H
          const index = row * cols + col
          if (!reduceMotion && Math.random() < SWAP_RATE * dt) glyphs[index] = (Math.random() * GLYPHS.length) | 0

          // Burst energy: strongest contribution of any live burst.
          let energy = 0
          for (const b of bursts) {
            if (hash(col + b.seed, row - b.seed) > DENSITY) continue
            // Euclidean in pixel space (rows are taller than columns), so the front is a round ring.
            const dist = Math.hypot(col - b.col, ((row - b.row) * CELL_H) / CELL_W)
            if (dist > RANGE) continue
            const arrive = b.start + dist / SPEED + hash(col * 1.7 + b.seed, row * 2.3) * JITTER
            const since = t - arrive
            if (since < 0) continue
            if (flash[index] < arrive) {
              flash[index] = arrive
              glyphs[index] = (Math.random() * GLYPHS.length) | 0 // the front rewrites what it touches
            }
            const reach = 1 - (dist / RANGE) ** 2 // holds its strength, then dies at the edge
            const e = (HEAD_GAIN * Math.exp(-since * HEAD_DECAY) + BODY_GAIN * Math.exp(-since * BODY_DECAY)) * reach
            energy = Math.max(energy, e * (0.55 + 0.45 * hash(col - b.seed, row + b.seed)))
          }
          // The cursor wakes a sparse handful of faint cells, nothing more.
          const near = Math.abs(col - pointer.col) + Math.abs(row - pointer.row)
          if (near < HOVER_RADIUS && hash(col * 3.1, row * 5.7) < 0.35) energy = Math.max(energy, 0.22 * (1 - near / HOVER_RADIUS))

          // Bursts soften over the headline so it stays readable.
          const cx = (x - width / 2) / (width * 0.3)
          const cy = (y - height / 2) / (height * 0.36)
          energy *= 1 - CALM * Math.max(0, 1 - Math.hypot(cx, cy))

          let alpha: number
          let mix = 0
          if (energy > 0.12) {
            const step = Math.min(STEPS, Math.ceil(Math.min(1, energy) * STEPS)) / STEPS
            alpha = INK_FLOOR + (INK_CEIL - INK_FLOOR) * Math.pow(step, RAMP_POW)
            mix = Math.pow(step, 1.6)
          } else {
            // Rest: a slow gust of noise drifting across an almost black field.
            const wind = noise(x * WIND_SCALE + t * WIND_SPEED, y * WIND_SCALE - t * WIND_SPEED * 0.7)
            alpha = REST_ALPHA + WIND_ALPHA * Math.max(0, wind - 0.5) * 2
          }
          const r = COOL[0] + (HOT[0] - COOL[0]) * mix
          const g = COOL[1] + (HOT[1] - COOL[1]) * mix
          const bl = COOL[2] + (HOT[2] - COOL[2]) * mix
          ctx.fillStyle = `rgba(${r | 0}, ${g | 0}, ${bl | 0}, ${alpha})`
          ctx.fillText(GLYPHS[glyphs[index]], x, y)
        }
      }
      ctx.globalCompositeOperation = "source-over"
    }

    const loop = (now: number) => {
      draw(now)
      if (visible && !reduceMotion) frame = requestAnimationFrame(loop)
    }
    const kick = () => {
      cancelAnimationFrame(frame)
      last = performance.now()
      if (visible && !reduceMotion) frame = requestAnimationFrame(loop)
    }

    const cell = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const offsetX = (width - cols * CELL_W) / 2
      const offsetY = (height - rows * CELL_H) / 2
      return {
        col: Math.floor((event.clientX - rect.left - offsetX) / CELL_W),
        row: Math.floor((event.clientY - rect.top - offsetY) / CELL_H),
      }
    }
    const fire = (col: number, row: number, start: number) => {
      bursts.push({ col, row, start, seed: Math.random() * 1000 })
      if (bursts.length > 8) bursts.shift()
    }
    const onDown = (event: PointerEvent) => {
      const { col, row } = cell(event)
      fire(col, row, performance.now() / 1000)
    }
    const onMove = (event: PointerEvent) => Object.assign(pointer, cell(event))
    const onLeave = () => Object.assign(pointer, { col: -999, row: -999 })

    resize()
    const ro = new ResizeObserver(() => {
      resize()
      if (reduceMotion) draw(performance.now())
    })
    ro.observe(canvas)
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      kick()
    })
    io.observe(canvas)
    host.addEventListener("pointerdown", onDown)
    host.addEventListener("pointermove", onMove)
    host.addEventListener("pointerleave", onLeave)

    // One burst from the center on load, so people see it is interactive.
    if (!reduceMotion) fire(cols >> 1, rows >> 1, performance.now() / 1000 + 0.5)
    // Redraw once the mono font is ready so glyph metrics are right.
    document.fonts?.ready.then(() => draw(performance.now()))
    draw(performance.now())
    kick()

    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
      io.disconnect()
      host.removeEventListener("pointerdown", onDown)
      host.removeEventListener("pointermove", onMove)
      host.removeEventListener("pointerleave", onLeave)
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden className={cn("pointer-events-none", className)} />
}
