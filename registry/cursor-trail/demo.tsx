"use client"

import { Flame, Heart, Smile, Sparkles, Star, Zap } from "lucide-react"
import { CursorTrail } from "./cursor-trail"

const stickers = [
  { icon: Smile, bg: "#f6a5ff", fg: "#5b1060", shape: "rounded-full" },
  { icon: Star, bg: "#c8f560", fg: "#2e4a00", shape: "rounded-[30%] rotate-12" },
  { icon: Heart, bg: "#ff6b5b", fg: "#4a0b05", shape: "rounded-full" },
  { icon: Zap, bg: "#7ee8e2", fg: "#05403c", shape: "rounded-2xl" },
  { icon: Flame, bg: "#ffd25e", fg: "#5a3a00", shape: "rounded-full" },
  { icon: Sparkles, bg: "#a99bff", fg: "#21136b", shape: "rounded-[38%]" },
]

const items = stickers.map(({ icon: Icon, bg, fg, shape }, i) => (
  <span key={i} className={`grid size-full place-items-center border-[3px] border-white shadow-lg ${shape}`} style={{ backgroundColor: bg, color: fg }}>
    <Icon className="size-1/2" strokeWidth={2.5} />
  </span>
))

export default function Demo() {
  return (
    <CursorTrail items={items} size={56} spacing={40} className="grid h-[300px] w-[440px] max-w-full place-items-center rounded-2xl border bg-background">
      <span className="text-center text-[10px] tracking-widest text-muted-foreground uppercase">
        Move your
        <br />
        cursor here
      </span>
    </CursorTrail>
  )
}
