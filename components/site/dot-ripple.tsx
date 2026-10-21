"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

const SPACING = 22 // px between dots
const DOT = 1.1 // dot radius
const BASE_ALPHA = 0.16
const WAVE_SPEED = 620 // px per second
const WAVE_WIDTH = 90 // px, thickness of the bright ring
const WAVE_LIFE = 2.4 // seconds before a wave fades out
const PUSH = 6 // px a dot is pushed outward at the wave crest
const HOVER_RADIUS = 140
const ACCENT = [255, 122, 69] // Ember

type Wave = { x: number; y: number; start: number }

/**
 * Dot grid that answers clicks with an expanding wave: dots inside the ring
 * light up in the brand color and get nudged outward. Dots near the cursor
 * glow a little. Listens on the parent so content above it stays clickable.
 */
export function DotRipple({ className }: { className?: string }) {
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
    let frame = 0
    let visible = true

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = (now: number) => {
      const t = now / 1000
      ctx.clearRect(0, 0, width, height)
      for (let i = waves.length - 1; i >= 0; i--) if (t - waves[i].start > WAVE_LIFE) waves.splice(i, 1)

      const offsetX = (width % SPACING) / 2
      const offsetY = (height % SPACING) / 2
      for (let y = offsetY; y <= height; y += SPACING) {
        for (let x = offsetX; x <= width; x += SPACING) {
          let glow = 0
          let dx = 0
          let dy = 0
          for (const wave of waves) {
            const age = t - wave.start
            const radius = age * WAVE_SPEED
            const vx = x - wave.x
            const vy = y - wave.y
            const dist = Math.hypot(vx, vy) || 1
            const band = 1 - Math.abs(dist - radius) / WAVE_WIDTH
            if (band <= 0) continue
            const strength = band * (1 - age / WAVE_LIFE)
            glow = Math.max(glow, strength)
            dx += (vx / dist) * PUSH * strength
            dy += (vy / dist) * PUSH * strength
          }
          const hover = Math.max(0, 1 - Math.hypot(x - pointer.x, y - pointer.y) / HOVER_RADIUS) * 0.35
          const lift = Math.max(glow, hover)
          const alpha = BASE_ALPHA + lift * (1 - BASE_ALPHA)
          const r = 255 + (ACCENT[0] - 255) * glow
          const g = 255 + (ACCENT[1] - 255) * glow
          const b = 255 + (ACCENT[2] - 255) * glow
          ctx.fillStyle = `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${alpha})`
          ctx.beginPath()
          ctx.arc(x + dx, y + dy, DOT + glow * 1.2, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    const loop = (now: number) => {
      draw(now)
      if (visible && !reduceMotion) frame = requestAnimationFrame(loop)
    }
    const kick = () => {
      cancelAnimationFrame(frame)
      if (visible && !reduceMotion) frame = requestAnimationFrame(loop)
    }

    const local = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      return { x: event.clientX - rect.left, y: event.clientY - rect.top }
    }
    const onDown = (event: PointerEvent) => {
      const p = local(event)
      waves.push({ ...p, start: performance.now() / 1000 })
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
