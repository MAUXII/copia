"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

/** Ember ramp: background, deep red, orange, amber highlight. */
const RAMP = ["#0a0302", "#7a0f00", "#ff4d1c", "#ffd29a"]
/** Light ramp: paper, peach, orange, deep ember. */
const RAMP_LIGHT = ["#ffffff", "#ffd9bf", "#ff8a4c", "#ff4d1c"]
const RENDER_SCALE = 0.45 // the smoke is blurred anyway; low resolution keeps it cheap

const VERTEX = "attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }"

/* Domain-warped fbm rising from the bottom edge, mapped to a 4-stop color ramp. */
const FRAGMENT = `
precision highp float;
uniform vec2 r; uniform float t; uniform vec3 k0; uniform vec3 k1; uniform vec3 k2; uniform vec3 k3;
vec2 hash(vec2 p){ p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return -1. + 2. * fract(sin(p) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
  return mix(mix(dot(hash(i), f), dot(hash(i + vec2(1, 0)), f - vec2(1, 0)), u.x),
             mix(dot(hash(i + vec2(0, 1)), f - vec2(0, 1)), dot(hash(i + vec2(1, 1)), f - vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p){ float v = 0., a = .5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6); for (int i = 0; i < 4; i++){ v += a * noise(p); p = m * p; a *= .5; } return v; }
vec3 ramp(float x){ x = clamp(x, 0., 1.); return x < .33 ? mix(k0, k1, x / .33) : x < .7 ? mix(k1, k2, (x - .33) / .37) : mix(k2, k3, (x - .7) / .3); }
void main(){
  vec2 uv = gl_FragCoord.xy / r; vec2 p = vec2(uv.x * r.x / r.y, uv.y) * 1.35;
  float tt = t * .12;
  vec2 q = vec2(fbm(p + vec2(6.2, -tt)), fbm(p + vec2(11.4, 1.3 - tt)));
  vec2 w = vec2(fbm(p + 3. * q + vec2(1.7, 9.2) - vec2(0., tt * 1.6)), fbm(p + 3. * q + vec2(8.3, 2.8) - vec2(0., tt * 1.3)));
  float f = fbm(p + 2.6 * w);
  float rise = smoothstep(1.1, -.05, uv.y + f * .9 - w.x * .35);
  float density = clamp(rise * (.65 + f * 1.2) + w.y * .25, 0., 1.);
  density = smoothstep(.08, .8, density);
  vec3 col = mix(k0, ramp(pow(density, 1.1)), smoothstep(0., .22, density));
  gl_FragColor = vec4(col, 1.);
}`

function hexToRgb(hex: string) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
}

export function Smoke({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas?.getContext("webgl")
    if (!canvas || !gl) return

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      return shader
    }
    const program = gl.createProgram()!
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX))
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT))
    gl.linkProgram(program)
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, "a")
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    const uniform = (name: string) => gl.getUniformLocation(program, name)
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const applyTheme = () => {
      const ramp = document.documentElement.classList.contains("dark") ? RAMP : RAMP_LIGHT
      ramp.forEach((hex, i) => gl.uniform3fv(uniform(`k${i}`), hexToRgb(hex)))
      if (reduceMotion) draw(performance.now())
    }
    let frame = 0
    let visible = true

    const draw = (now: number) => {
      const width = Math.round(canvas.clientWidth * RENDER_SCALE)
      const height = Math.round(canvas.clientHeight * RENDER_SCALE)
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        gl.viewport(0, 0, width, height)
      }
      gl.uniform2f(uniform("r"), width, height)
      gl.uniform1f(uniform("t"), now / 1000 + 20)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
    const loop = (now: number) => {
      draw(now)
      if (visible && !reduceMotion) frame = requestAnimationFrame(loop)
    }

    const themeObserver = new MutationObserver(applyTheme)
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    applyTheme()

    // Pause when the hero scrolls out of view.
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      cancelAnimationFrame(frame)
      if (visible) frame = requestAnimationFrame(loop)
    })
    observer.observe(canvas)

    return () => {
      cancelAnimationFrame(frame)
      themeObserver.disconnect()
      observer.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden className={cn("pointer-events-none blur-[16px] saturate-[1.3]", className)} />
}
