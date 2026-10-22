"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, LayoutGrid, Lightbulb, Upload } from "lucide-react"
import { useEffect, useState } from "react"
import { REPO_URL } from "@/lib/site"
import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/", label: "Components", icon: LayoutGrid },
  { href: "/requests", label: "Requests", icon: Lightbulb },
  { href: "/publish", label: "Publish", icon: Upload },
  { href: `${REPO_URL}/tree/main/docs`, label: "Docs", icon: BookOpen, external: true },
]

/** Luma-style text links: small icon + label, dim until active or hovered. */
export function NavLinks() {
  const pathname = usePathname()
  return (
    <div className="hidden items-center gap-5 sm:flex">
      {LINKS.map(({ href, label, icon: Icon, external }) => {
        const active = !external && pathname === href
        return (
          <Link
            key={label}
            href={href}
            {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
            aria-current={active ? "page" : undefined}
            className={cn("flex items-center gap-1.5 text-sm font-medium transition-colors", active ? "text-foreground" : "text-foreground/50 hover:text-foreground")}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </Link>
        )
      })}
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
