"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import type { Meta } from "@/lib/schema"

/** "Apple (iPhone Dynamic Island), studied via …" -> "after Apple". */
function shortCredit(meta: Meta) {
  if (!meta.inspiration.url) return "original"
  return `after ${meta.inspiration.author.split(/,| \(/)[0]}`
}

export function ComponentCard({ meta }: { meta: Meta }) {
  const video = useRef<HTMLVideoElement>(null)

  // Touch screens have no hover: play while the card is on screen instead.
  useEffect(() => {
    const el = video.current
    if (!el || !window.matchMedia?.("(hover: none)").matches || !("IntersectionObserver" in window)) return
    const observer = new IntersectionObserver(([entry]) => (entry.isIntersecting ? el.play().catch(() => {}) : el.pause()), { threshold: 0.6 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Link
      href={`/c/${meta.slug}`}
      className="group block rounded-2xl border bg-card p-2 transition-colors hover:border-foreground/20 focus-visible:outline-2 focus-visible:outline-highlight"
      onMouseEnter={() => video.current?.play().catch(() => {})}
      onMouseLeave={() => {
        if (!video.current) return
        video.current.pause()
        video.current.currentTime = 0
      }}
    >
      <div className="aspect-[16/10] overflow-hidden rounded-xl bg-background">
        <video
          ref={video}
          src={`/previews/${meta.slug}.mp4`}
          poster={`/previews/${meta.slug}.webp`}
          muted
          playsInline
          loop
          preload="none"
          className="size-full object-cover"
          aria-hidden
        />
      </div>
      <div className="flex flex-col gap-0.5 px-2 pt-3 pb-1">
        <span className="text-sm font-medium">{meta.name}</span>
        <span className="truncate text-xs text-muted-foreground">{shortCredit(meta)}</span>
      </div>
    </Link>
  )
}
