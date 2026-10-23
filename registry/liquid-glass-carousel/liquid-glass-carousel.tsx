"use client"

import { useEffect, useId, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export type LiquidGlassItem = {
  src: string
  title: string
  /** Width / height. Read from the image when omitted. */
  aspect?: number
}

export type LiquidGlassCarouselProps = {
  items: LiquidGlassItem[]
  /** Target panel height in px; scaled down when the container is shorter. */
  panelHeight?: number
  gap?: number
  /** Corner radius of each panel, in px. */
  radius?: number
  /** Lens size, as a multiple of the reference lens. */
  lensSize?: number
  /** Colour of the glowing ring around the lens rim. */
  lensColor?: string
  /** Chromatic split at the rim. 0 turns it off. */
  dispersion?: number
  /** Seconds between automatic steps; any input pauses it for a while. 0 turns it off. */
  autoplay?: number
  /** Panels rise in and the lens blooms on mount. */
  entry?: boolean
  className?: string
  onActiveChange?: (index: number) => void
}

type Engine = { step: (direction: number) => void; focusCenter: () => void; close: () => void; destroy: () => void }

// The lens, measured from the reference (65° ellipse, rim swirl, ring, nova glow).
const LENS = { sizeX: 0.565, sizeY: 1, rotation: (65 * Math.PI) / 180 }
// Motion, per 60 fps frame like the reference; scaled by real frame time below.
const EASE = 0.09
const SNAP_EASE = 0.05
const TOUCH_EASE = 0.22
const WHEEL = 1.4
const DRAG = 1.6
const TOUCH_DRAG = 1
const FRICTION = 0.865
const SNAP_IDLE_MS = 120
const SHRINK_MAX = 60 // px per frame that counts as full speed; panels shrink up to 25% while flying
const CLICK_SLOP = 6
const FLICK_IDLE_MS = 90
const IDLE_BEFORE_AUTOPLAY_MS = 4000

const VERTEX = `
attribute vec2 a;
uniform vec4 uRect;
uniform vec2 uRes;
varying vec2 vUv;
void main() {
  vUv = a;
  vec2 px = uRect.xy + a * uRect.zw;
  gl_Position = vec4(px / uRes * 2.0 - 1.0, 0.0, 1.0) * vec4(1.0, -1.0, 1.0, 1.0);
}`

// A photo, cover-fitted, with rounded corners; a flat tone while it loads.
const PANEL = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uReady;
uniform vec2 uCover;
uniform vec2 uSize;
uniform float uRadius;
uniform vec3 uTone;
void main() {
  vec2 q = abs(vUv - 0.5) * uSize - (uSize * 0.5 - uRadius);
  float d = length(max(q, 0.0)) - uRadius;
  float alpha = clamp(0.5 - d, 0.0, 1.0);
  vec3 c = uReady > 0.5 ? texture2D(uTex, (vUv - 0.5) * uCover + 0.5).rgb : uTone;
  gl_FragColor = vec4(c, alpha);
}`

const FULL = `
attribute vec2 a;
varying vec2 vUv;
void main() { vUv = a; gl_Position = vec4(a * 2.0 - 1.0, 0.0, 1.0); }`

// Ported from the reference shader, with its fixed settings folded into constants.
const LENS_FRAGMENT = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uAspect;
uniform vec2 uSize;
uniform float uRotation;
uniform float uDispersion;
uniform float uRing;
uniform float uRimLine;
uniform float uRimSwirl;
uniform float uShimmer;
uniform vec3 uBg;
uniform float uTime;
uniform vec3 uColor;
const float GLOW = 4.2;
const float WHITE_GLOW = 0.24;
const float NOVA = 12.0;
const float RING_RADIUS = 0.49;
const float RING_WIDTH = 0.014;
const float RIM_START = 0.578;
const float RIM_LINE_POS = 0.488;
const float RIM_LINE_WIDTH = 0.003;
const int SAMPLES = 16;

void main() {
  vec3 base = texture2D(uTex, vUv).rgb;
  vec2 offset = vUv - 0.5;
  vec2 p = offset;
  p.x *= uAspect;
  float ca = cos(uRotation), sa = sin(uRotation);
  p = mat2(ca, -sa, sa, ca) * p;
  float dist = length(p / uSize);
  if (dist > 1.0) { gl_FragColor = vec4(base, 1.0); return; }

  float nd = clamp(dist, 0.0, 1.0);
  vec2 radial = normalize(offset + 1e-6);
  vec2 tangent = vec2(-radial.y, radial.x);
  float angle = atan(p.y, p.x);

  // The rim drags the image sideways in a slow two-lobe swirl.
  float rim = smoothstep(RIM_START, 1.0, nd);
  float wave = sin(angle * 2.0) * 0.55 + sin(angle) * 0.25;
  float rScreen = (uSize.x + uSize.y) * 0.5;
  vec2 uv = 0.5 + offset + tangent * wave * rim * rScreen * uRimSwirl;

  // Chromatic dispersion: 16 taps along the radius, weighted red to blue.
  vec2 spread = offset * uDispersion * 0.004 * smoothstep(0.55, 1.0, nd);
  vec3 col = vec3(0.0);
  vec3 total = vec3(0.0);
  for (int i = 0; i < SAMPLES; i++) {
    float t = float(i) / float(SAMPLES - 1);
    vec3 s = texture2D(uTex, uv + spread * (t - 0.5)).rgb;
    vec3 w = vec3(exp(-pow(t / 0.38, 2.0)), exp(-pow((t - 0.5) / 0.38, 2.0)), exp(-pow((t - 1.0) / 0.38, 2.0)));
    col += s * w;
    total += w;
  }
  col /= max(total, vec3(0.001));
  col *= mix(0.91, 1.0, smoothstep(0.0, 0.38, nd));
  // Copia: the glass only glows where it bends an image. The reference adds its glow onto a white
  // page, where it clips to white and vanishes; on any other page this keeps that look.
  // Measured around the point, not only on it, so the glow spills a little past each image edge
  // (the bright fringe the reference shows where the glass folds over a photo's edge).
  float near = distance(col, uBg);
  for (int k = 0; k < 8; k++) {
    float a = float(k) * 0.785398;
    near = max(near, distance(texture2D(uTex, uv + vec2(cos(a) / uAspect, sin(a)) * 0.022).rgb, uBg));
  }
  float content = smoothstep(0.03, 0.18, distance(col, uBg));
  float fringe = smoothstep(0.03, 0.18, near);

  // Soft white nova in the middle, a coloured ring and a thin bright line at the rim.
  float r2 = nd * nd * 0.25;
  float gs = max(NOVA * GLOW * 0.003, 0.004);
  col += vec3((exp(-r2 / gs) + exp(-r2 / (gs * 7.0)) * 0.18) * WHITE_GLOW * (GLOW / 17.0) * 1.15 * content);
  float dC = nd * 0.5;
  float ring = exp(-pow((dC - RING_RADIUS) / RING_WIDTH, 2.0)) * uRing * (GLOW / 17.0) * 1.8;
  ring *= sin(angle * 12.0 + uTime * 3.5) * 0.12 * uShimmer + (1.0 - 0.12 * uShimmer);
  float aura = exp(-pow((dC - RING_RADIUS) / (RING_WIDTH * 6.0), 2.0)) * 0.28 * uRing * (GLOW / 17.0);
  col += uColor * (ring + aura) * fringe;
  col += vec3(exp(-pow((dC - RIM_LINE_POS) / RIM_LINE_WIDTH, 2.0)) * uRimLine) * fringe;

  gl_FragColor = vec4(mix(base, col, smoothstep(1.0, 0.93, dist)), 1.0);
}`

const easeOut = (power: number) => (t: number) => 1 - Math.pow(1 - t, power)
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

function parseColor(value: string): [number, number, number] {
  const hex = /^#([0-9a-f]{6})$/i.exec(value.trim())
  if (hex) return [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16) / 255) as [number, number, number]
  const rgb = value.match(/[\d.]+/g)
  return rgb && rgb.length >= 3 ? [Number(rgb[0]) / 255, Number(rgb[1]) / 255, Number(rgb[2]) / 255] : [1, 1, 1]
}

function compile(gl: WebGLRenderingContext, vertex: string, fragment: string) {
  const program = gl.createProgram()!
  for (const [type, source] of [
    [gl.VERTEX_SHADER, vertex],
    [gl.FRAGMENT_SHADER, fragment],
  ] as const) {
    const shader = gl.createShader(type)!
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? "shader")
    gl.attachShader(program, shader)
  }
  gl.linkProgram(program)
  const uniforms = new Map<string, WebGLUniformLocation | null>()
  return {
    program,
    u: (name: string) => {
      if (!uniforms.has(name)) uniforms.set(name, gl.getUniformLocation(program, name))
      return uniforms.get(name)!
    },
  }
}

type Options = Required<Pick<LiquidGlassCarouselProps, "panelHeight" | "gap" | "radius" | "lensSize" | "lensColor" | "dispersion" | "autoplay" | "entry">> & {
  items: LiquidGlassItem[]
  onActive: (index: number) => void
  onFocus: (focused: boolean) => void
  onReady: () => void
}

function createEngine(root: HTMLElement, canvas: HTMLCanvasElement, cursor: HTMLElement, o: Options): Engine | null {
  const gl = canvas.getContext("webgl", { alpha: false, antialias: false, premultipliedAlpha: false })
  if (!gl || o.items.length === 0) return null
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const panelProgram = compile(gl, VERTEX, PANEL)
  const lensProgram = compile(gl, FULL, LENS_FRAGMENT)
  const quad = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, quad)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW)

  // Panels render into this texture; the lens pass reads it back.
  const target = gl.createTexture()
  const fbo = gl.createFramebuffer()

  const sources = o.items.map((item) => ({ aspect: item.aspect ?? 0.75, tex: null as WebGLTexture | null, w: 1, h: 1 }))
  sources.forEach((s, i) => {
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.decoding = "async"
    image.onload = () => {
      const tex = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      s.tex = tex
      s.w = image.naturalWidth
      s.h = image.naturalHeight
      if (o.items[i].aspect === undefined) {
        s.aspect = s.w / s.h
        measure()
        if (!touched) scroll = goal = centerFor(0)
      }
    }
    image.src = o.items[i].src
  })

  let W = 1
  let H = 1
  let dpr = 1
  let panelH = 1
  let offsets: number[] = []
  let total = 1
  const slot = (i: number) => sources[i].aspect * panelH + o.gap
  const slotCenter = (i: number) => offsets[i] + slot(i) / 2 - o.gap / 2
  function measure() {
    offsets = []
    let acc = 0
    sources.forEach((_, i) => {
      offsets.push(acc)
      acc += slot(i)
    })
    total = acc
  }
  const centerFor = (index: number) => {
    const n = sources.length
    return slotCenter(((index % n) + n) % n) + Math.floor(index / n) * total
  }
  /** Nearest slot to `value`, as an unwrapped index (loops count). */
  function nearest(value: number) {
    let best = 0
    let bestDist = Infinity
    sources.forEach((_, i) => {
      const k = Math.round((value - slotCenter(i)) / total)
      const dist = Math.abs(slotCenter(i) + k * total - value)
      if (dist < bestDist) {
        bestDist = dist
        best = i + k * sources.length
      }
    })
    return best
  }
  const wrap = (index: number) => ((index % sources.length) + sources.length) % sources.length

  function resize() {
    W = Math.max(1, root.clientWidth)
    H = Math.max(1, root.clientHeight)
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    panelH = Math.max(120, Math.min(o.panelHeight, Math.round(H * 0.52)))
    measure()
    gl!.bindTexture(gl!.TEXTURE_2D, target)
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, canvas.width, canvas.height, 0, gl!.RGBA, gl!.UNSIGNED_BYTE, null)
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR)
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE)
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE)
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo)
    gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, target, 0)
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, null)
    if (!touched) scroll = goal = centerFor(0)
  }

  // The background follows the page theme: read the root's computed colour when the theme flips.
  let background: [number, number, number] = [1, 1, 1]
  let tone: [number, number, number] = [0.9, 0.9, 0.9]
  const readTheme = () => {
    background = parseColor(getComputedStyle(root).backgroundColor)
    const light = background[0] + background[1] + background[2] > 1.5
    tone = background.map((c) => c + (light ? -0.08 : 0.08)) as [number, number, number]
  }
  const ringColor = parseColor(o.lensColor)

  // Scroll state.
  let scroll = 0
  let goal = 0
  let velocity = 0
  let previous = 0
  let energy = 0
  let touched = false
  let snapped = false
  let lastInput = performance.now()
  let pendingFocus: number | null = null
  let lastActive = -1

  // Tweened state: lens effects, focus scale, per-panel drop and entry rise.
  const fx = { value: o.entry && !reduced ? 0 : 1 }
  const focus = { active: false, key: "", scale: 1 }
  const drop = new Map<string, number>()
  const rise = new Map<string, number>()
  let entering = o.entry && !reduced
  type Tween = { from: number; to: number; start: number; duration: number; ease: (t: number) => number; set: (v: number) => void; done?: () => void }
  let tweens: Tween[] = []
  const tween = (set: (v: number) => void, from: number, to: number, duration: number, ease: (t: number) => number, delay = 0, done?: () => void) => {
    const t: Tween = { from, to, start: performance.now() + delay * 1000, duration: Math.max(1, duration * 1000), ease, set, done }
    if (reduced) {
      set(to)
      done?.()
      return
    }
    tweens.push(t)
  }

  // What is on screen this frame, for hit testing and focus.
  type Rect = { key: string; index: number; x: number; left: number; right: number; top: number; bottom: number }
  let rects: Rect[] = []

  function layout() {
    rects = []
    const half = W / 2
    const shrink = 1 - 0.25 * energy
    sources.forEach((s, i) => {
      let x = (((slotCenter(i) - scroll) % total) + total) % total
      // Every copy of this slot that can be seen: the row repeats forever.
      for (x -= Math.ceil((x + half + panelH * 2) / total) * total; x < half + panelH * 2; x += total) {
        if (x < -half - panelH * 2) continue
        const loop = Math.round((scroll + x - slotCenter(i)) / total)
        const key = `${i}@${loop}`
        let h = panelH * shrink
        let w = s.aspect * h
        let y = H / 2
        if (focus.active && key === focus.key) {
          h *= focus.scale
          w *= focus.scale
        } else y += (drop.get(key) ?? 0) * H * 1.4
        if (entering) y += (1 - (rise.get(key) ?? 0)) * H * 0.9
        rects.push({ key, index: i, x, left: half + x - w / 2, right: half + x + w / 2, top: y - h / 2, bottom: y + h / 2 })
      }
    })
  }

  const centered = () => rects.reduce<Rect | null>((best, r) => (!best || Math.abs(r.x) < Math.abs(best.x) ? r : best), null)
  const hit = (px: number, py: number) => rects.find((r) => px >= r.left && px <= r.right && py >= r.top && py <= r.bottom) ?? null

  function openFocus() {
    const center = centered()
    if (focus.active || !center || !sources[center.index].tex) return
    focus.active = true
    focus.key = center.key
    goal = centerFor(nearest(scroll))
    tween((v) => (fx.value = v), fx.value, 0, 0.85, easeOut(3))
    tween((v) => (focus.scale = v), focus.scale, 1.18, 0.9, easeOut(3))
    // Neighbours fall away, nearest first.
    const others = rects.filter((r) => r.key !== center.key).sort((a, b) => Math.abs(a.x - center.x) - Math.abs(b.x - center.x))
    others.forEach((r, rank) => tween((v) => drop.set(r.key, v), drop.get(r.key) ?? 0, 1, 0.7, easeOut(4), Math.ceil(rank / 2) * 0.06))
    setView(false)
    o.onFocus(true)
  }

  function closeFocus() {
    if (!focus.active) return
    o.onFocus(false)
    tween((v) => (fx.value = v), fx.value, 1, 0.68, easeInOut)
    tween((v) => (focus.scale = v), focus.scale, 1, 0.76, easeOut(3), 0, () => {
      focus.active = false
      focus.key = ""
    })
    const center = rects.find((r) => r.key === focus.key)
    const others = [...drop.keys()].sort((a, b) => {
      const ra = rects.find((r) => r.key === a)
      const rb = rects.find((r) => r.key === b)
      return Math.abs((rb?.x ?? 0) - (center?.x ?? 0)) - Math.abs((ra?.x ?? 0) - (center?.x ?? 0))
    })
    others.forEach((key, rank) => tween((v) => drop.set(key, v), drop.get(key) ?? 1, 0, 0.6, easeOut(4), Math.floor(rank / 2) * 0.042, () => drop.delete(key)))
  }

  const locked = () => focus.active || entering

  function step(direction: number) {
    if (locked()) return
    touched = true
    velocity = 0
    pendingFocus = null
    goal = centerFor(nearest(scroll) + direction)
    snapped = true
    lastInput = performance.now()
  }

  // Pointer: drag with flick momentum, click the centre panel to focus it, click another to bring it in.
  let dragging = false
  let dragId = -1
  let dragType = "mouse"
  let dragX = 0
  let dragDist = 0
  let dragVel = 0
  let dragTime = 0
  let suppressClick = false
  let viewing = false
  let pointer = { x: -1, y: -1, inside: false }
  const cursorPos = { x: 0, y: 0 }
  const local = (e: { clientX: number; clientY: number }) => {
    const b = canvas.getBoundingClientRect()
    return { x: e.clientX - b.left, y: e.clientY - b.top }
  }
  function setView(on: boolean) {
    on = on && !dragging && !locked()
    if (on === viewing) return
    viewing = on
    cursor.style.opacity = on ? "1" : "0"
    cursor.style.scale = on ? "1" : "0.6"
    canvas.style.cursor = locked() ? "" : on ? "grab" : ""
  }

  const onWheel = (e: WheelEvent) => {
    e.preventDefault()
    if (locked()) return
    touched = true
    pendingFocus = null
    goal += (e.deltaY || e.deltaX) * WHEEL
    lastInput = performance.now()
    snapped = false
  }
  const onDown = (e: PointerEvent) => {
    suppressClick = false
    if (locked() || dragging || (e.pointerType === "mouse" && e.button !== 0)) return
    dragging = true
    dragId = e.pointerId
    dragType = e.pointerType || "mouse"
    canvas.setPointerCapture?.(e.pointerId)
    dragX = local(e).x
    dragDist = 0
    dragVel = 0
    dragTime = performance.now()
    velocity = 0
    pendingFocus = null
    touched = true
    snapped = false
    lastInput = dragTime
    setView(false)
    canvas.style.cursor = "grabbing"
  }
  const onMove = (e: PointerEvent) => {
    const p = local(e)
    if (dragging && e.pointerId === dragId) {
      const sens = dragType === "mouse" ? DRAG : TOUCH_DRAG
      const dx = p.x - dragX
      dragX = p.x
      dragDist += Math.abs(dx)
      goal -= dx * sens
      dragVel = dragVel * 0.6 - dx * sens * 0.4
      dragTime = lastInput = performance.now()
      snapped = false
    }
    pointer = { ...p, inside: true }
    if (e.pointerType === "mouse") setView(!focus.active && hit(p.x, p.y) !== null)
  }
  const onUp = (e: PointerEvent) => {
    if (!dragging || e.pointerId !== dragId) return
    dragging = false
    canvas.releasePointerCapture?.(e.pointerId)
    velocity = performance.now() - dragTime > FLICK_IDLE_MS ? 0 : dragVel
    lastInput = performance.now()
    snapped = false
    suppressClick = dragDist > (dragType === "mouse" ? CLICK_SLOP : CLICK_SLOP * 2)
    canvas.style.cursor = ""
    if (dragType === "mouse") setView(hit(pointer.x, pointer.y) !== null)
  }
  const onLeave = () => {
    pointer.inside = false
    setView(false)
  }
  const onClick = (e: MouseEvent) => {
    if (suppressClick) return void (suppressClick = false)
    if (focus.active) return closeFocus()
    if (entering) return
    const p = local(e)
    const r = hit(p.x, p.y)
    if (!r) return
    const center = centered()
    if (center && r.key === center.key) return openFocus()
    touched = true
    velocity = 0
    goal = centerFor(nearest(scroll + r.x))
    snapped = true
    pendingFocus = r.index
    setView(false)
  }

  canvas.addEventListener("wheel", onWheel, { passive: false })
  canvas.addEventListener("pointerdown", onDown)
  canvas.addEventListener("pointermove", onMove)
  canvas.addEventListener("pointerup", onUp)
  canvas.addEventListener("pointercancel", onUp)
  canvas.addEventListener("pointerleave", onLeave)
  canvas.addEventListener("click", onClick)

  function draw(now: number) {
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo)
    gl!.viewport(0, 0, canvas.width, canvas.height)
    gl!.clearColor(background[0], background[1], background[2], 1)
    gl!.clear(gl!.COLOR_BUFFER_BIT)
    gl!.enable(gl!.BLEND)
    gl!.blendFunc(gl!.SRC_ALPHA, gl!.ONE_MINUS_SRC_ALPHA)
    gl!.useProgram(panelProgram.program)
    gl!.bindBuffer(gl!.ARRAY_BUFFER, quad)
    const aPanel = gl!.getAttribLocation(panelProgram.program, "a")
    gl!.enableVertexAttribArray(aPanel)
    gl!.vertexAttribPointer(aPanel, 2, gl!.FLOAT, false, 0, 0)
    gl!.uniform2f(panelProgram.u("uRes"), canvas.width, canvas.height)
    gl!.uniform3fv(panelProgram.u("uTone"), tone)
    gl!.uniform1i(panelProgram.u("uTex"), 0)
    gl!.activeTexture(gl!.TEXTURE0)
    for (const r of rects) {
      if (r.right < 0 || r.left > W || r.top > H || r.bottom < 0) continue
      const s = sources[r.index]
      const w = (r.right - r.left) * dpr
      const h = (r.bottom - r.top) * dpr
      // Cover-fit the photo into the panel's aspect.
      const panelAspect = w / h
      const imageAspect = s.w / s.h
      const cover = s.tex ? (imageAspect > panelAspect ? [panelAspect / imageAspect, 1] : [1, imageAspect / panelAspect]) : [1, 1]
      gl!.bindTexture(gl!.TEXTURE_2D, s.tex)
      gl!.uniform1f(panelProgram.u("uReady"), s.tex ? 1 : 0)
      gl!.uniform2f(panelProgram.u("uCover"), cover[0], cover[1])
      gl!.uniform2f(panelProgram.u("uSize"), w, h)
      gl!.uniform1f(panelProgram.u("uRadius"), Math.min(o.radius * dpr, w / 2, h / 2))
      gl!.uniform4f(panelProgram.u("uRect"), r.left * dpr, r.top * dpr, w, h)
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4)
    }
    gl!.disable(gl!.BLEND)

    gl!.bindFramebuffer(gl!.FRAMEBUFFER, null)
    gl!.useProgram(lensProgram.program)
    const aLens = gl!.getAttribLocation(lensProgram.program, "a")
    gl!.enableVertexAttribArray(aLens)
    gl!.vertexAttribPointer(aLens, 2, gl!.FLOAT, false, 0, 0)
    gl!.bindTexture(gl!.TEXTURE_2D, target)
    gl!.uniform1i(lensProgram.u("uTex"), 0)
    gl!.uniform1f(lensProgram.u("uAspect"), W / H)
    gl!.uniform2f(lensProgram.u("uSize"), LENS.sizeX * o.lensSize, LENS.sizeY * o.lensSize)
    gl!.uniform1f(lensProgram.u("uRotation"), LENS.rotation)
    gl!.uniform1f(lensProgram.u("uDispersion"), o.dispersion * fx.value)
    gl!.uniform1f(lensProgram.u("uRing"), 6 * fx.value)
    gl!.uniform1f(lensProgram.u("uRimLine"), 1.4 * fx.value)
    gl!.uniform1f(lensProgram.u("uRimSwirl"), 0.6 * fx.value)
    gl!.uniform1f(lensProgram.u("uShimmer"), reduced ? 0 : 1)
    gl!.uniform3fv(lensProgram.u("uBg"), background)
    gl!.uniform1f(lensProgram.u("uTime"), now / 1000)
    gl!.uniform3fv(lensProgram.u("uColor"), ringColor)
    gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4)
  }

  let raf = 0
  let last = performance.now()
  let visible = true
  let lastAuto = performance.now()
  function tick(now: number) {
    raf = 0
    if (!visible || document.hidden) return
    const frames = Math.min(4, (now - last) / 16.67)
    last = now
    const follow = (k: number) => 1 - Math.pow(1 - k, frames)

    tweens = tweens.filter((t) => {
      const p = Math.min(1, Math.max(0, (now - t.start) / t.duration))
      if (now >= t.start) t.set(t.from + (t.to - t.from) * t.ease(p))
      if (p >= 1) t.done?.()
      return p < 1
    })

    if (!dragging) {
      goal += velocity * frames
      velocity *= Math.pow(FRICTION, frames)
      if (Math.abs(velocity) < 0.05) velocity = 0
      if (!snapped && !focus.active && now - lastInput > SNAP_IDLE_MS) {
        goal = centerFor(nearest(scroll))
        snapped = true
      }
      // Copia: autoplay steps forward while nobody is touching it.
      if (o.autoplay > 0 && !locked() && now - lastInput > IDLE_BEFORE_AUTOPLAY_MS * Number(touched) && now - lastAuto > o.autoplay * 1000) {
        lastAuto = now
        goal = centerFor(nearest(scroll) + 1)
        snapped = true
      }
    }
    scroll += (goal - scroll) * follow(dragging && dragType !== "mouse" ? TOUCH_EASE : snapped && pendingFocus === null ? SNAP_EASE : EASE)

    const speed = Math.abs(scroll - previous) / Math.max(1, frames)
    previous = scroll
    const norm = Math.min(1, speed / SHRINK_MAX)
    energy += (norm - energy) * follow(norm > energy ? 0.25 : 0.06)

    layout()
    const active = wrap(nearest(scroll))
    if (active !== lastActive) {
      lastActive = active
      o.onActive(active)
    }
    if (pendingFocus !== null && Math.abs(goal - scroll) < 0.5) {
      const index = pendingFocus
      pendingFocus = null
      if (centered()?.index === index) openFocus()
    }
    // The "View" label trails the pointer.
    cursorPos.x += (pointer.x - cursorPos.x) * follow(0.2)
    cursorPos.y += (pointer.y - cursorPos.y) * follow(0.2)
    cursor.style.translate = `${cursorPos.x + 14}px ${cursorPos.y + 18}px`

    draw(now)
    raf = requestAnimationFrame(tick)
  }
  const start = () => {
    if (!raf && visible) {
      last = performance.now()
      raf = requestAnimationFrame(tick)
    }
  }

  // Entry: panels rise from below in a loose stagger, then the lens blooms.
  readTheme()
  resize()
  layout()
  if (entering) {
    const keys = rects.map((r) => r.key)
    const spread = 0.07 * Math.max(keys.length - 1, 1)
    let end = 0
    keys.forEach((key) => {
      const at = 0.5 + Math.random() * spread
      end = Math.max(end, at + 1)
      rise.set(key, 0)
      tween((v) => rise.set(key, v), 0, 1, 1, easeOut(3), at)
    })
    tween((v) => (fx.value = v), 0, 1, 1.4, easeInOut, end + 0.1, () => {
      entering = false
      o.onReady()
    })
    // Keys not on screen at mount appear normally.
    setTimeout(() => (entering = entering && rise.size > 0), 0)
  } else o.onReady()
  start()

  const ro = new ResizeObserver(() => {
    resize()
    start()
  })
  ro.observe(root)
  const io = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? true
    start()
  })
  io.observe(root)
  const theme = new MutationObserver(readTheme)
  theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] })
  const onVisibility = () => start()
  document.addEventListener("visibilitychange", onVisibility)

  return {
    step,
    focusCenter: () => (focus.active ? closeFocus() : openFocus()),
    close: closeFocus,
    destroy() {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      theme.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
      canvas.removeEventListener("wheel", onWheel)
      canvas.removeEventListener("pointerdown", onDown)
      canvas.removeEventListener("pointermove", onMove)
      canvas.removeEventListener("pointerup", onUp)
      canvas.removeEventListener("pointercancel", onUp)
      canvas.removeEventListener("pointerleave", onLeave)
      canvas.removeEventListener("click", onClick)
      sources.forEach((s) => s.tex && gl.deleteTexture(s.tex))
      gl.deleteTexture(target)
      gl.deleteFramebuffer(fbo)
      gl.deleteBuffer(quad)
      gl.deleteProgram(panelProgram.program)
      gl.deleteProgram(lensProgram.program)
    },
  }
}

const pad = (n: number) => String(n).padStart(2, "0")

/**
 * An endless row of photos seen through a liquid-glass lens: a rotated
 * ellipse that swirls, splits colour at its rim and glows with a ring. Drag,
 * flick, scroll or use the arrows; click the middle photo to focus it.
 * Give the container a height.
 */
export function LiquidGlassCarousel({
  items,
  panelHeight = 450,
  gap = 12,
  radius = 6,
  lensSize = 1,
  lensColor = "#ff7a45",
  dispersion = 11,
  autoplay = 0,
  entry = true,
  className,
  onActiveChange,
}: LiquidGlassCarouselProps) {
  const root = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const cursor = useRef<HTMLDivElement>(null)
  const engine = useRef<Engine | null>(null)
  const callback = useRef(onActiveChange)
  const [active, setActive] = useState(0)
  const [focused, setFocused] = useState(false)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const labelId = useId()

  useEffect(() => {
    callback.current = onActiveChange
  })

  useEffect(() => {
    if (!root.current || !canvas.current || !cursor.current) return
    let created: Engine | null = null
    try {
      created = createEngine(root.current, canvas.current, cursor.current, {
        items,
        panelHeight,
        gap,
        radius,
        lensSize,
        lensColor,
        dispersion,
        autoplay,
        entry,
        onActive: (index) => {
          setActive(index)
          callback.current?.(index)
        },
        onFocus: setFocused,
        onReady: () => setReady(true),
      })
    } catch {
      created = null
    }
    if (!created) {
      setFailed(true)
      return
    }
    engine.current = created
    return () => {
      created?.destroy()
      engine.current = null
    }
  }, [items, panelHeight, gap, radius, lensSize, lensColor, dispersion, autoplay, entry])

  const current = items[active] ?? items[0]

  return (
    <div
      ref={root}
      role="region"
      aria-roledescription="carousel"
      aria-labelledby={labelId}
      tabIndex={0}
      onKeyDown={(e) => {
        const keys: Record<string, () => void> = {
          ArrowRight: () => engine.current?.step(1),
          ArrowLeft: () => engine.current?.step(-1),
          Enter: () => engine.current?.focusCenter(),
          Escape: () => engine.current?.close(),
        }
        if (!keys[e.key]) return
        e.preventDefault()
        keys[e.key]()
      }}
      className={cn("relative h-full min-h-[420px] w-full overflow-hidden bg-background text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
    >
      <p id={labelId} className="sr-only">
        Photo carousel
      </p>
      <p className="sr-only" aria-live="polite">
        {current?.title}, {active + 1} of {items.length}
        {focused ? ", focused" : ""}
      </p>
      <canvas ref={canvas} aria-hidden className="absolute inset-0 size-full touch-none select-none" />
      {failed && <p className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">This carousel needs WebGL.</p>}
      <p
        className="pointer-events-none absolute top-[4.5%] left-1/2 m-0 text-[15px] font-medium tracking-[-0.02em] transition-[opacity,translate] duration-500 sm:text-[17px]"
        style={{ opacity: ready ? 1 : 0, translate: focused ? "-50% -0.5rem" : "-50% 0" }}
      >
        {current?.title}
      </p>
      <p
        className="pointer-events-none absolute bottom-[6%] left-1/2 m-0 -translate-x-1/2 text-[13px] font-medium tracking-[-0.02em] tabular-nums transition-opacity duration-500 sm:text-[15px]"
        style={{ opacity: ready && !focused ? 1 : 0 }}
      >
        {pad(active + 1)}/{pad(items.length)}
      </p>
      <div
        ref={cursor}
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 text-[13px] font-medium text-white mix-blend-difference transition-[opacity,scale] duration-300"
        style={{ opacity: 0, scale: "0.6" }}
      >
        View
      </div>
      <button
        type="button"
        onClick={() => engine.current?.close()}
        aria-label="Close the focused photo"
        className="absolute top-[4.5%] right-[4%] text-[13px] font-medium text-white mix-blend-difference transition-opacity duration-300"
        style={{ opacity: focused ? 1 : 0, pointerEvents: focused ? "auto" : "none" }}
      >
        Close
      </button>
    </div>
  )
}
