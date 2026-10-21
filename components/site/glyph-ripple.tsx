"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

const CELL_W = 14 // px per column
const CELL_H = 18 // px per row
const FONT = '12px "Geist Mono", ui-monospace, monospace'
const RAMP = ["·", "∙", "•", "+", "×", "✳", "✶"] // calm → intense
const BASE_ALPHA = 0.14
const WAVE_SPEED = 560 // px per second
const WAVE_WIDTH = 110 // px, thickness of the ring
const WAVE_LIFE = 2.6 // seconds
const HOVER_RADIUS = 150
const TWINKLE = 0.0025 // chance per cell per frame to flicker while idle
const ACCENT = [255, 122, 69] // Ember

type Wave = { x: number; y: number; start: number }

/**
 * A grid of monospace glyphs, like the Claude desktop background. Clicking
 * sends a wave that swaps glyphs for denser ones and tints them in the brand
 * color; glyphs near the cursor scramble; a few twinkle while idle. Listens on
 * the parent so content above stays clickable.
 */
export function GlyphRipple({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    const host = canvas?.parentElement
    if (!canvas || !ctx || !host) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const waves: Wave[] = []
    const pointer = { x: -9999, y: -9999 }
    let width = 0
    let height = 0
    let cols = 0
    let rows = 0
    let twinkle = new Float32Array(0) // per-cell flicker energy, decays over time
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
      twinkle = new Float32Array(cols * rows)
    }

    const draw = (now: number) => {
      const t = now / 1000
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      ctx.clearRect(0, 0, width, height)
      ctx.font = FONT
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      for (let i = waves.length - 1; i >= 0; i--) if (t - waves[i].start > WAVE_LIFE) waves.splice(i, 1)

      const offsetX = (width - cols * CELL_W) / 2 + CELL_W / 2
      const offsetY = (height - rows * CELL_H) / 2 + CELL_H / 2
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = offsetX + col * CELL_W
          const y = offsetY + row * CELL_H
          const index = row * cols + col

          let wave = 0
          for (const w of waves) {
            const age = t - w.start
            const band = 1 - Math.abs(Math.hypot(x - w.x, y - w.y) - age * WAVE_SPEED) / WAVE_WIDTH
            if (band > 0) wave = Math.max(wave, band * (1 - age / WAVE_LIFE))
          }
          const near = Math.max(0, 1 - Math.hypot(x - pointer.x, y - pointer.y) / HOVER_RADIUS)
          if (!reduceMotion && Math.random() < TWINKLE + near * 0.08) twinkle[index] = 0.35 + Math.random() * 0.4 * (1 + near)
          twinkle[index] = Math.max(0, twinkle[index] - dt * 0.9)

          const energy = Math.max(wave, twinkle[index] * 0.6, near * 0.25)
          const glyph = RAMP[Math.min(RAMP.length - 1, Math.floor(energy * RAMP.length))]
          const alpha = BASE_ALPHA + energy * (1 - BASE_ALPHA) * 0.9
          const r = 255 + (ACCENT[0] - 255) * wave
          const g = 255 + (ACCENT[1] - 255) * wave
          const b = 255 + (ACCENT[2] - 255) * wave
          ctx.fillStyle = `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${alpha})`
          ctx.fillText(glyph, x, y)
        }
      }
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

    const local = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      return { x: event.clientX - rect.left, y: event.clientY - rect.top }
    }
    const onDown = (event: PointerEvent) => {
      waves.push({ ...local(event), start: performance.now() / 1000 })
      if (waves.length > 6) waves.shift()
    }
    const onMove = (event: PointerEvent) => Object.assign(pointer, local(event))
    const onLeave = () => Object.assign(pointer, { x: -9999, y: -9999 })

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

    // One wave from the center on load, so people see it is interactive.
    if (!reduceMotion) waves.push({ x: width / 2, y: height / 2, start: performance.now() / 1000 + 0.4 })
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
