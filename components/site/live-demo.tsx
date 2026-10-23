"use client"

import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react"
import { demos } from "@/lib/demos"

// The same page the preview recorder uses: demos are tuned for it.
const STAGE_W = 512
const STAGE_H = 320

/**
 * A component's demo running for real inside a card: rendered on a 512×320
 * stage and scaled to fit, mounted only once the card scrolls near the
 * screen, so a grid of them stays light.
 */
export function LiveDemo({ slug }: { slug: string }) {
  const box = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)
  const [near, setNear] = useState(false)
  const Demo = useMemo(() => (demos[slug] ? lazy(demos[slug]) : null), [slug])

  useEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / STAGE_W))
    ro.observe(el)
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setNear(true), { rootMargin: "200px" })
    io.observe(el)
    return () => {
      ro.disconnect()
      io.disconnect()
    }
  }, [])

  return (
    <div ref={box} className="relative aspect-[16/10] overflow-hidden rounded-xl bg-background">
      {Demo && near && scale > 0 && (
        <div className="absolute top-0 left-0 flex flex-col" style={{ width: STAGE_W, height: STAGE_H, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
          <Suspense fallback={null}>
            <Demo />
          </Suspense>
        </div>
      )}
    </div>
  )
}
