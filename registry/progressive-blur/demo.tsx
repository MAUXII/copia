"use client"

import { useEffect, useRef } from "react"
import { ProgressiveBlur, type ProgressiveBlurProps } from "./progressive-blur"

const paragraph =
  "Most components here are recreations of the best interfaces on the web. We study how they work, rebuild them as a single file, add a feature or two and credit the people who made them first. Scroll and the words drift under the edges of the page, melting into blur the way iOS does it: layer over layer, a little softer each time, until the text is only a shape and then nothing at all."

/** Scrolls the page slowly for the preview recording; any user input stops it. */
function useDemoAutoScroll(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let el: HTMLElement | null = ref.current?.parentElement ?? null
    while (el && !(["auto", "scroll"].includes(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight)) el = el.parentElement
    const scroller = el ?? (document.scrollingElement as HTMLElement)
    let position = scroller.scrollTop
    let last = performance.now()
    let frame = 0
    let stopped = false
    const stop = () => (stopped = true)
    const step = (now: number) => {
      if (stopped) return
      const max = scroller.scrollHeight - scroller.clientHeight
      position = position >= max - 1 ? 0 : position + (70 * (now - last)) / 1000
      scroller.scrollTop = position
      last = now
      frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    const events = ["wheel", "pointerdown", "touchstart", "keydown"] as const
    events.forEach((t) => window.addEventListener(t, stop, { once: true, capture: true }))
    return () => {
      cancelAnimationFrame(frame)
      events.forEach((t) => window.removeEventListener(t, stop, { capture: true }))
    }
  }, [ref])
}

/** Customizer values (layers, maxBlur, curve, tint) flow into both blurs. */
export default function Demo(props: Pick<ProgressiveBlurProps, "layers" | "maxBlur" | "curve" | "tint">) {
  const root = useRef<HTMLDivElement>(null)
  useDemoAutoScroll(root)
  return (
    <div ref={root} className="flex-1 bg-background text-foreground">
      <ProgressiveBlur {...props} direction="top" sticky className="h-32" />
      <article className="mx-auto flex max-w-xl flex-col items-center gap-12 px-8 pt-[28vh] pb-[30vh]">
        <div className="flex flex-col items-center gap-3">
          <span className="text-center text-[10px] leading-tight tracking-wide text-foreground/50 uppercase">
            Scroll down
            <br />
            to see the effect
          </span>
          <span className="h-14 w-px bg-foreground/40" />
        </div>
        {Array.from({ length: 6 }, (_, i) => (
          <p key={i} className="text-justify text-base leading-relaxed text-foreground/40">
            {paragraph}
          </p>
        ))}
      </article>
      <ProgressiveBlur {...props} direction="bottom" sticky className="h-32" />
    </div>
  )
}
