import Link from "next/link"
import { Copy, LayoutGrid, Sparkles } from "lucide-react"
import { ComponentGrid } from "@/components/site/component-grid"
import { PublishNudge } from "@/components/site/publish-nudge"
import { getComponents } from "@/lib/registry"
import { CATEGORIES, type Meta } from "@/lib/schema"
import { cn } from "@/lib/utils"

export type Collection = "all" | "craft" | "copies"

export const COLLECTIONS: Record<Collection, { label: string; href: string; title: string; intro: string; icon: typeof LayoutGrid }> = {
  all: {
    label: "All",
    href: "/components",
    title: "Components",
    intro: "Everything in Copia: our own crafted pieces and credited copies of the best interfaces on the web. One file each, free and open source.",
    icon: LayoutGrid,
  },
  craft: { label: "Craft", href: "/components/craft", title: "Craft", intro: "Copia's own pieces: small, clean interactions that morph and settle, made here from scratch.", icon: Sparkles },
  copies: {
    label: "Copies",
    href: "/components/copies",
    title: "Copies",
    intro: "The best interfaces on the web, recreated as one file each, often with a feature more, and always credited to whoever made them first.",
    icon: Copy,
  },
}

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

/** Collection switch: icons in a pill group, the active one opens to show its label. */
function CollectionSwitch({ active, counts }: { active: Collection; counts: Record<Collection, number> }) {
  return (
    <div className="inline-flex min-h-9 items-center gap-1 rounded-full bg-muted p-0.5">
      {(Object.keys(COLLECTIONS) as Collection[]).map((c) => {
        const { label, href, icon: Icon } = COLLECTIONS[c]
        const on = c === active
        return (
          <Link
            key={c}
            href={href}
            aria-current={on ? "page" : undefined}
            title={`${label} (${counts[c]})`}
            className={cn(
              "inline-flex h-8 min-w-8 items-center justify-center gap-1.5 rounded-full px-2.5 text-xs font-medium transition-colors",
              on ? "bg-background text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.1)]" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-3.5" aria-hidden />
            {on && label}
          </Link>
        )
      })}
    </div>
  )
}

/** Left column, pinned to the edge like beui.dev: collection switch, then the components by category. */
function Sidebar({ all, items, active }: { all: Meta[]; items: Meta[]; active: Collection }) {
  const counts = { all: all.length, craft: all.filter((m) => m.collection === "craft").length, copies: all.filter((m) => m.collection === "copies").length }
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

/** /components, /components/craft and /components/copies: the sidebar pinned left, the grid beside it. */
export function Library({ collection }: { collection: Collection }) {
  const all = getComponents()
  const items = collection === "all" ? all : all.filter((m) => m.collection === collection)
  const meta = COLLECTIONS[collection]
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] px-4 pt-14 md:grid-cols-[15rem_minmax(0,1fr)] md:gap-10 md:px-8">
      <Sidebar all={all} items={items} active={collection} />
      <div className="min-w-0 pt-10 pb-24">
        <p className="text-sm font-medium">{collection === "all" ? "Library" : "Components"}</p>
        <h1 className="mt-2 text-4xl font-medium tracking-tight">{meta.title}</h1>
        <p className="mt-3 mb-8 max-w-2xl text-muted-foreground">{meta.intro}</p>
        {/* Collections as tabs on small screens, where the sidebar is hidden. */}
        <div className="mb-8 flex gap-5 text-sm md:hidden">
          {(Object.keys(COLLECTIONS) as Collection[]).map((c) => (
            <Link key={c} href={COLLECTIONS[c].href} className={c === collection ? "font-medium text-foreground" : "text-muted-foreground"}>
              {COLLECTIONS[c].label}
            </Link>
          ))}
        </div>
        {items.length ? <ComponentGrid items={items} /> : <p className="border-t border-border pt-10 text-sm text-muted-foreground">Nothing here yet.</p>}
      </div>
      <PublishNudge />
    </div>
  )
}
