"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Bot, ChevronDown, LayoutGrid, Lightbulb, Upload, Users } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/components", label: "Components", icon: LayoutGrid, active: (p: string) => (p.startsWith("/components") && !p.endsWith("/agents")) || p.startsWith("/c/") },
  { href: "/components/agents", label: "Agents", icon: Bot, active: (p: string) => p.endsWith("/components/agents") },
  { href: "/guides", label: "Guides", icon: BookOpen, active: (p: string) => p.startsWith("/guides") },
]

// One line each, so every row has the same height.
const COMMUNITY = [
  { href: "/requests", label: "Requests", hint: "Ask for one, or vote", icon: Lightbulb },
  { href: "/publish", label: "Publish", hint: "Send yours, credited", icon: Upload },
  { href: "/authors", label: "Authors", hint: "Everyone we credit", icon: Users },
]

const linkClass = (active: boolean) => cn("flex items-center gap-1.5 text-sm font-medium transition-colors", active ? "text-foreground" : "text-foreground/50 hover:text-foreground")

/** Community: a small menu, opened by hover or click, closed by Escape, a click outside or navigating. */
function CommunityMenu() {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const active = COMMUNITY.some((c) => pathname === c.href) || pathname.startsWith("/@") || pathname.startsWith("/u/")

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return
    const close = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false)
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("pointerdown", close)
    window.addEventListener("keydown", esc)
    return () => {
      window.removeEventListener("pointerdown", close)
      window.removeEventListener("keydown", esc)
    }
  }, [open])

  return (
    <div ref={root} className="relative" onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)} onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}>
      <button type="button" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((o) => !o)} className={linkClass(active || open)}>
        <Users className="size-4" aria-hidden />
        Community
        <ChevronDown className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        // The padding bridges the gap so the pointer can travel from the button to the menu.
        <div className="absolute top-full -left-3 pt-3">
          <div role="menu" className="flex w-60 flex-col rounded-2xl bg-popover p-1.5 text-popover-foreground shadow-xl ring-1 ring-border">
            {COMMUNITY.map(({ href, label, hint, icon: Icon }) => (
              <Link
                key={href}
                role="menuitem"
                href={href}
                aria-current={pathname === href ? "page" : undefined}
                className="flex h-14 items-center gap-3 rounded-xl px-3 transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium">{label}</span>
                  <span className="truncate text-xs text-muted-foreground">{hint}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/** Luma-style text links: small icon + label, dim until active or hovered. */
export function NavLinks() {
  const pathname = usePathname()
  return (
    <div className="hidden items-center gap-5 sm:flex">
      {LINKS.map(({ href, label, icon: Icon, active }) => (
        <Link key={label} href={href} aria-current={active(pathname) ? "page" : undefined} className={linkClass(active(pathname))}>
          <Icon className="size-4" aria-hidden />
          {label}
        </Link>
      ))}
      <CommunityMenu />
    </div>
  )
}

/** Local time with the time zone, like Luma ("18:26 BRT"). Rendered after mount to avoid a hydration mismatch. */
export function LocalTime() {
  const [time, setTime] = useState("")
  useEffect(() => {
    const format = () =>
      new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", timeZoneName: "short" }).format(new Date())
    setTime(format())
    const id = setInterval(() => setTime(format()), 30_000)
    return () => clearInterval(id)
  }, [])
  return (
    <time className="hidden text-sm font-medium text-foreground/50 tabular-nums md:block" suppressHydrationWarning>
      {time}
    </time>
  )
}
