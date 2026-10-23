"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CollectionSwitch } from "@/components/site/collection-switch"
import { CATEGORIES, type Meta } from "@/lib/schema"
import { cn } from "@/lib/utils"

type Collection = "all" | "craft" | "copies"

const CATEGORY_LABELS: Record<string, string> = { buttons: "Buttons", text: "Text", cards: "Cards", navigation: "Navigation", effects: "Effects" }

/** Measured from beui.dev's sidebar: 14px links, 4×10 padding, 8px corners, the active one on a 6% foreground wash. */
function SidebarLink({ href, active, isNew, children }: { href: string; active?: boolean; isNew?: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center justify-between gap-2 rounded-lg px-2.5 py-1 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        active ? "bg-foreground/[0.06] font-medium text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <span className="truncate">{children}</span>
      {isNew && <span className="rounded-full bg-[color-mix(in_oklab,var(--highlight)_14%,transparent)] px-1.5 py-px text-[10px] font-semibold tracking-wide text-highlight uppercase">New</span>}
    </Link>
  )
}

/** 11px semibold uppercase section label with a count pill, as on beui.dev. */
function SectionLabel({ children, count }: { children: React.ReactNode; count: number }) {
  return (
    <p className="mb-1.5 flex items-center gap-2 px-2.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
      {children}
      <span className="rounded-md bg-muted px-1.5 font-mono text-[10px] font-medium tabular-nums">{count}</span>
    </p>
  )
}

/** Left column, pinned to the edge like beui.dev: collection switch, then the components by category. */
export function LibrarySidebar({ all }: { all: Meta[] }) {
  // Lives in the shared layout, so it stays mounted between collections and the switch animates.
  const pathname = usePathname()
  const active = ((["craft", "copies"] as const).find((c) => pathname.endsWith(`/${c}`)) ?? "all") as Collection
  const items = active === "all" ? all : all.filter((m) => m.collection === active)
  const counts = { all: all.length, craft: 0, copies: 0 }
  for (const m of all) counts[m.collection]++
  // "New" marks the most recent day components were added.
  const newest = all.reduce((latest, m) => (m.createdAt > latest ? m.createdAt : latest), "")
  return (
    <div className="hidden md:block">
      <div className="sticky top-14 h-[calc(100dvh-3.5rem)] w-60 overflow-y-auto py-6 pr-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <nav aria-label="Components" className="flex flex-col gap-6">
          <CollectionSwitch active={active} counts={counts} />
          {CATEGORIES.map((category) => {
            const list = items.filter((m) => m.category === category)
            if (!list.length) return null
            return (
              <div key={category} className="flex flex-col">
                <SectionLabel count={list.length}>{CATEGORY_LABELS[category]}</SectionLabel>
                {list.map((m) => (
                  <SidebarLink key={m.slug} href={`/c/${m.slug}`} isNew={m.createdAt === newest}>
                    {m.name}
                  </SidebarLink>
                ))}
              </div>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

