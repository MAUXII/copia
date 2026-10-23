"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import type { Meta } from "@/lib/schema"
import { PREVIEW_THEMES } from "@/lib/previews"
import { cn } from "@/lib/utils"
import { LiveDemo } from "./live-demo"

/** "Apple (iPhone Dynamic Island), studied via …" -> "after Apple". */
function shortCredit(meta: Meta) {
  if (!meta.inspiration.url) return "original"
  return `after ${meta.inspiration.author.split(/,| \(/)[0]}`
}

/** Craft pieces are small and light, so their card runs the demo live; you can use it right there. */
function LiveCard({ meta }: { meta: Meta }) {
  return (
    <div className="group relative rounded-2xl border bg-card p-2 transition-colors hover:border-foreground/20">
      <LiveDemo slug={meta.slug} />
      <Link href={`/c/${meta.slug}`} className="flex items-end justify-between gap-2 rounded-lg px-2 pt-3 pb-1 outline-none focus-visible:outline-2 focus-visible:outline-highlight">
        <span className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{meta.name}</span>
          <span className="truncate text-xs text-muted-foreground">{shortCredit(meta)}</span>
        </span>
        <span className="text-xs text-muted-foreground transition-colors group-hover:text-foreground">Open →</span>
      </Link>
    </div>
  )
}

export function ComponentCard({ meta }: { meta: Meta }) {
  if (meta.collection !== "copies") return <LiveCard meta={meta} />
  return <VideoCard meta={meta} />
}

function VideoCard({ meta }: { meta: Meta }) {
  // One take per theme; CSS shows the one that matches the page and only that one plays.
  const videos = useRef<(HTMLVideoElement | null)[]>([])
  const shown = () => videos.current.find((v) => v && v.offsetParent !== null) ?? null

  // Touch screens have no hover: play while the card is on screen instead.
  useEffect(() => {
    const el = videos.current[0]?.parentElement
    if (!el || !window.matchMedia?.("(hover: none)").matches || !("IntersectionObserver" in window)) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = shown()
        if (entry.isIntersecting) video?.play().catch(() => {})
        else videos.current.forEach((v) => v?.pause())
      },
      { threshold: 0.6 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Link
      href={`/c/${meta.slug}`}
      className="group block rounded-2xl border bg-card p-2 transition-colors hover:border-foreground/20 focus-visible:outline-2 focus-visible:outline-highlight"
      onMouseEnter={() => shown()?.play().catch(() => {})}
      onMouseLeave={() => {
        videos.current.forEach((v) => {
          if (!v) return
          v.pause()
          v.currentTime = 0
        })
      }}
    >
      <div className="aspect-[16/10] overflow-hidden rounded-xl bg-background">
        {PREVIEW_THEMES.map(({ suffix }, i) => (
          <video
            key={suffix}
            ref={(el) => {
              videos.current[i] = el
            }}
            src={`/previews/${meta.slug}${suffix}.mp4`}
            poster={`/previews/${meta.slug}${suffix}.webp`}
            muted
            playsInline
            loop
            preload="none"
            className={cn("size-full object-cover", suffix ? "dark:hidden" : "hidden dark:block")}
            aria-hidden
          />
        ))}
      </div>
      <div className="flex flex-col gap-0.5 px-2 pt-3 pb-1">
        <span className="text-sm font-medium">{meta.name}</span>
        <span className="truncate text-xs text-muted-foreground">{shortCredit(meta)}</span>
      </div>
    </Link>
  )
}
