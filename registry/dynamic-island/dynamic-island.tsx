"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Bell, BellOff, Pause, Phone, PhoneOff, Play, SkipBack, SkipForward, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type IslandView = "idle" | "ring" | "silent" | "timer" | "recording" | "music" | "call" | "notification"

export type DynamicIslandProps = {
  /** Which activity the island shows. Changing it morphs the island. */
  view?: IslandView
  /** Seconds on the timer view. */
  timerSeconds?: number
  /** Track shown on the music view. */
  track?: { title: string; artist: string }
  /** Caller shown on the call view. */
  caller?: string
  /** Notification shown on the notification view. */
  notification?: { app: string; message: string }
  /** Custom content; replaces the built-in view and uses `size`. */
  children?: React.ReactNode
  /** Size for custom content. */
  size?: { width: number; height: number; radius?: number }
  className?: string
}

const SIZES: Record<IslandView, { width: number; height: number; radius: number }> = {
  idle: { width: 120, height: 34, radius: 20 },
  ring: { width: 200, height: 34, radius: 20 },
  silent: { width: 200, height: 34, radius: 20 },
  recording: { width: 220, height: 34, radius: 20 },
  timer: { width: 284, height: 56, radius: 28 },
  call: { width: 284, height: 56, radius: 28 },
  notification: { width: 340, height: 72, radius: 30 },
  music: { width: 360, height: 168, radius: 42 },
}

const LABELS: Record<IslandView, string> = {
  idle: "",
  ring: "Ring mode",
  silent: "Silent mode",
  timer: "Timer running",
  recording: "Recording",
  music: "Now playing",
  call: "Incoming call",
  notification: "New notification",
}

const MORPH = { type: "spring", bounce: 0.35, duration: 0.55 } as const
const CONTENT = {
  initial: { opacity: 0, filter: "blur(4px)", scale: 0.92 },
  animate: { opacity: 1, filter: "blur(0px)", scale: 1, transition: { type: "spring", bounce: 0.3, duration: 0.5, delay: 0.08 } },
  exit: { opacity: 0, filter: "blur(4px)", scale: 0.92, transition: { duration: 0.15 } },
} as const

/** An iPhone-style Dynamic Island that morphs between live activities. */
export function DynamicIsland({
  view = "idle",
  timerSeconds = 60,
  track = { title: "Glow Echo", artist: "Copia" },
  caller = "Maurício",
  notification = { app: "Copia", message: "Your component was merged" },
  children,
  size,
  className,
}: DynamicIslandProps) {
  const reduceMotion = useReducedMotion()
  const box = children && size ? { radius: 28, ...size } : SIZES[view]
  const key = children ? "custom" : view

  return (
    <motion.div
      initial={false}
      animate={{ width: box.width, height: box.height, borderRadius: box.radius }}
      transition={reduceMotion ? { duration: 0 } : MORPH}
      className={cn("relative overflow-hidden bg-black text-white shadow-[0_0_0_1px_rgb(255_255_255/0.04)]", className)}
    >
      {/* Announce only which activity is showing, not every tick of its clocks. */}
      <span role="status" className="sr-only">
        {children ? "" : LABELS[view]}
      </span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div key={key} {...(reduceMotion ? {} : CONTENT)} className="absolute inset-0 flex items-center">
          {children ?? <View view={view} timerSeconds={timerSeconds} track={track} caller={caller} notification={notification} />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

function View({ view, timerSeconds, track, caller, notification }: Required<Pick<DynamicIslandProps, "timerSeconds" | "track" | "caller" | "notification">> & { view: IslandView }) {
  switch (view) {
    case "ring":
    case "silent": {
      const silent = view === "silent"
      return (
        <div className="flex w-full items-center justify-between px-2.5 text-xs font-medium">
          <span className={cn("grid h-5 w-9 place-items-center rounded-full transition-colors", silent ? "bg-[#FD4F30]" : "bg-transparent")}>
            {silent ? <BellOff className="size-3.5" /> : <Bell className="size-3.5" />}
          </span>
          <span className={silent ? "text-[#FD4F30]" : "text-white"}>{silent ? "Silent" : "Ring"}</span>
        </div>
      )
    }
    case "recording":
      return (
        <div className="flex w-full items-center justify-between px-3">
          <Waveform color="#FD4F30" />
          <Elapsed className="font-mono text-[11px] text-[#FD4F30]" />
        </div>
      )
    case "timer":
      return <TimerView seconds={timerSeconds} />
    case "call":
      return (
        <div className="flex w-full items-center gap-3 px-3">
          <span className="grid size-9 place-items-center rounded-full bg-neutral-700 text-sm font-medium">{caller[0]}</span>
          <span className="flex flex-col leading-tight">
            <span className="text-[11px] text-neutral-400">Incoming call</span>
            <span className="text-sm font-medium">{caller}</span>
          </span>
          <span className="ml-auto flex gap-2">
            <span className="grid size-9 place-items-center rounded-full bg-[#FD4F30]">
              <PhoneOff className="size-4" />
            </span>
            <span className="grid size-9 place-items-center rounded-full bg-[#2FD057]">
              <Phone className="size-4" />
            </span>
          </span>
        </div>
      )
    case "notification":
      return (
        <div className="flex w-full items-center gap-3 px-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#ffc48a] to-[#ff4d1c] text-sm font-semibold text-black">{notification.app[0]}</span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="text-[11px] text-neutral-400">{notification.app}</span>
            <span className="truncate text-sm">{notification.message}</span>
          </span>
        </div>
      )
    case "music":
      return <MusicView track={track} />
    default:
      return null
  }
}

function useTick(intervalMs: number) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return tick
}

function Elapsed({ className }: { className?: string }) {
  const tick = useTick(1000)
  return <span className={className}>{`00:${String(tick % 60).padStart(2, "0")}`}</span>
}

function Waveform({ color, bars = 16 }: { color: string; bars?: number }) {
  const reduceMotion = useReducedMotion()
  return (
    <span className="flex h-4 items-center gap-[2px]" aria-hidden>
      {Array.from({ length: bars }, (_, i) => (
        <motion.span
          key={i}
          className="w-[2px] rounded-full"
          style={{ backgroundColor: color }}
          animate={reduceMotion ? { height: "50%" } : { height: ["20%", "100%", "35%", "80%", "20%"] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: (i * 0.13) % 0.9, ease: "easeInOut" }}
        />
      ))}
    </span>
  )
}

/** A digit that rolls in from below whenever it changes. */
function RollingDigit({ value }: { value: string }) {
  const reduceMotion = useReducedMotion()
  if (reduceMotion) return <span>{value}</span>
  return (
    <span className="relative inline-block h-[1.1em] w-[0.62em] overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.span
          key={value}
          className="absolute inset-0 text-center"
          initial={{ y: "100%", filter: "blur(2px)" }}
          animate={{ y: "0%", filter: "blur(0px)" }}
          exit={{ y: "-100%", filter: "blur(2px)" }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function TimerView({ seconds }: { seconds: number }) {
  const [left, setLeft] = useState(seconds)
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setLeft((n) => (n > 0 ? n - 1 : seconds)), 1000)
    return () => clearInterval(id)
  }, [paused, seconds])
  const text = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`
  return (
    <div className="flex w-full items-center gap-2 px-3">
      <button type="button" aria-label={paused ? "Resume timer" : "Pause timer"} onClick={() => setPaused((p) => !p)} className="grid size-9 place-items-center rounded-full bg-[#5A3C07] text-[#FDB000]">
        {paused ? <Play className="size-4 fill-current" /> : <Pause className="size-4 fill-current" />}
      </button>
      <button type="button" aria-label="Reset timer" onClick={() => setLeft(seconds)} className="grid size-9 place-items-center rounded-full bg-[#3C3D3C]">
        <X className="size-4" />
      </button>
      <span className="ml-auto flex items-baseline gap-2 text-[#FDB000]">
        <span className="text-xs">Timer</span>
        <span className="flex text-3xl font-light tabular-nums">
          {text.split("").map((char, i) => (char === ":" ? <span key={i}>:</span> : <RollingDigit key={i} value={char} />))}
        </span>
      </span>
    </div>
  )
}

function MusicView({ track }: { track: { title: string; artist: string } }) {
  const [playing, setPlaying] = useState(true)
  const tick = useTick(1000)
  const progress = ((tick % 120) / 120) * 100
  return (
    <div className="flex w-full flex-col gap-3 px-5">
      <div className="flex items-center gap-3">
        <span className="size-12 shrink-0 rounded-xl bg-gradient-to-br from-[#ff6aa0] via-[#ff9a8b] to-[#9ad7ff]" />
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-medium">{track.title}</span>
          <span className="text-xs text-neutral-400">{track.artist}</span>
        </span>
        <span className="ml-auto">{playing && <Waveform color="#159BF4" bars={6} />}</span>
      </div>
      <div className="flex items-center gap-2 font-mono text-[10px] text-neutral-400">
        <span>{`0:${String(tick % 60).padStart(2, "0")}`}</span>
        <span className="h-1 flex-1 overflow-hidden rounded-full bg-neutral-700">
          <span className="block h-full rounded-full bg-white transition-[width] duration-1000 ease-linear" style={{ width: `${progress}%` }} />
        </span>
        <span>-1:59</span>
      </div>
      <div className="flex items-center justify-center gap-6">
        <button type="button" aria-label="Previous track"><SkipBack className="size-5 fill-current" /></button>
        <button type="button" aria-label={playing ? "Pause" : "Play"} onClick={() => setPlaying((p) => !p)}>
          {playing ? <Pause className="size-6 fill-current" /> : <Play className="size-6 fill-current" />}
        </button>
        <button type="button" aria-label="Next track"><SkipForward className="size-5 fill-current" /></button>
      </div>
    </div>
  )
}
