import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Avatar } from "@/components/site/avatar"
import { ComponentGrid } from "@/components/site/component-grid"
import { avatarUrl, getPeople } from "@/lib/authors"
import { getComponents } from "@/lib/registry"
import { getRequests } from "@/lib/requests"
import { CATEGORIES, type Meta } from "@/lib/schema"
import { cn } from "@/lib/utils"

export type Collection = "all" | "craft" | "copies"

export const COLLECTIONS: Record<Collection, { label: string; href: string; title: string; intro: string }> = {
  all: {
    label: "Overview",
    href: "/components",
    title: "Components",
    intro: "Everything in Copia: our own crafted pieces and credited copies of the best interfaces on the web. One file each, free and open source.",
  },
  craft: { label: "Craft", href: "/components/craft", title: "Craft", intro: "Copia's own pieces: small, clean interactions that morph and settle, made here from scratch." },
  copies: {
    label: "Copies",
    href: "/components/copies",
    title: "Copies",
    intro: "The best interfaces on the web, recreated as one file each, often with a feature more, and always credited to whoever made them first.",
  },
}

const CATEGORY_LABELS: Record<string, string> = { buttons: "Buttons", text: "Text", cards: "Cards", navigation: "Navigation", effects: "Effects" }

function SidebarLink({ href, active, children, count }: { href: string; active?: boolean; children: React.ReactNode; count?: number }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors",
        active ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <span className="truncate">{children}</span>
      {count !== undefined && <span className="ml-2 rounded-full bg-muted px-1.5 font-mono text-[10px] text-muted-foreground tabular-nums">{count}</span>}
    </Link>
  )
}

function Heading({ children }: { children: React.ReactNode }) {
  return <p className="mt-6 mb-1.5 px-3 font-mono text-[10.5px] tracking-[0.12em] text-muted-foreground uppercase">{children}</p>
}

/** Left column, after beui.dev: collections, then every component by category. */
function Sidebar({ all, active }: { all: Meta[]; active: Collection }) {
  const count = (c: Collection) => (c === "all" ? all.length : all.filter((m) => m.collection === c).length)
  return (
    <nav aria-label="Library" className="sticky top-20 hidden max-h-[calc(100dvh-6rem)] self-start overflow-y-auto pr-2 pb-10 [scrollbar-width:thin] lg:block">
      <p className="mb-1.5 px-3 font-mono text-[10.5px] tracking-[0.12em] text-muted-foreground uppercase">Collections</p>
      {(Object.keys(COLLECTIONS) as Collection[]).map((c) => (
        <SidebarLink key={c} href={COLLECTIONS[c].href} active={c === active} count={count(c)}>
          {COLLECTIONS[c].label}
        </SidebarLink>
      ))}
      {CATEGORIES.map((category) => {
        const items = all.filter((m) => m.category === category)
        if (!items.length) return null
        return (
          <div key={category}>
            <Heading>
              {CATEGORY_LABELS[category]} <span className="opacity-60">{items.length}</span>
            </Heading>
            {items.map((m) => (
              <SidebarLink key={m.slug} href={`/c/${m.slug}`}>
                {m.name}
              </SidebarLink>
            ))}
          </div>
        )
      })}
    </nav>
  )
}

/** Right column: where beUI sells Pro, Copia shows its community. */
async function Aside() {
  const requests = ((await getRequests()) ?? []).filter((r) => !r.done).slice(0, 3)
  const people = getPeople().slice(0, 6)
  const box = "rounded-2xl bg-muted/50 p-4"
  return (
    <aside className="sticky top-20 hidden flex-col gap-4 self-start xl:flex">
      <section className={box}>
        <h2 className="text-sm font-medium">Most wanted</h2>
        {requests.length ? (
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {requests.map((r) => (
              <li key={r.number} className="flex justify-between gap-2">
                <a href={r.url} target="_blank" rel="noreferrer" className="truncate text-muted-foreground hover:text-foreground">
                  {r.title}
                </a>
                <span className="font-mono text-xs text-muted-foreground tabular-nums">{r.votes}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No requests yet.</p>
        )}
        <Link href="/requests" className="mt-3 inline-block text-xs text-foreground underline-offset-4 hover:underline">
          Request a component →
        </Link>
      </section>
      <section className={box}>
        <h2 className="text-sm font-medium">Publish yours</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">Copy something great or craft your own; it lands on your page, credited.</p>
        <Link href="/publish" className="mt-3 inline-flex h-8 items-center rounded-lg bg-foreground px-3 text-xs font-medium text-background">
          How to publish
        </Link>
      </section>
      <section className={box}>
        <h2 className="text-sm font-medium">Authors</h2>
        <div className="mt-3 flex -space-x-2">
          {people.map((p) => (
            <Link key={p.handle} href={`/@${p.handle}`} title={p.name} className="rounded-full ring-2 ring-background">
              <Avatar src={avatarUrl(p)} name={p.name} seed={p.handle} className="size-8" />
            </Link>
          ))}
        </div>
        <Link href="/authors" className="mt-3 inline-flex items-center gap-0.5 text-xs text-foreground underline-offset-4 hover:underline">
          Everyone <ArrowUpRight className="size-3" />
        </Link>
      </section>
    </aside>
  )
}

/** /components, /components/craft and /components/copies: three columns like beui.dev. */
export async function Library({ collection }: { collection: Collection }) {
  const all = getComponents()
  const items = collection === "all" ? all : all.filter((m) => m.collection === collection)
  const meta = COLLECTIONS[collection]
  return (
    <div className="mx-auto grid max-w-[90rem] grid-cols-1 gap-10 px-4 pt-24 lg:grid-cols-[14rem_minmax(0,1fr)] xl:grid-cols-[14rem_minmax(0,1fr)_17rem]">
      <Sidebar all={all} active={collection} />
      <div className="min-w-0">
        <p className="text-sm font-medium">{collection === "all" ? "Library" : "Components"}</p>
        <h1 className="mt-2 text-4xl font-medium tracking-tight">{meta.title}</h1>
        <p className="mt-3 mb-6 max-w-2xl text-muted-foreground">{meta.intro}</p>
        {/* Collections as tabs on small screens, where the sidebar is hidden. */}
        <div className="mb-8 flex gap-5 text-sm lg:hidden">
          {(Object.keys(COLLECTIONS) as Collection[]).map((c) => (
            <Link key={c} href={COLLECTIONS[c].href} className={c === collection ? "font-medium text-foreground" : "text-muted-foreground"}>
              {COLLECTIONS[c].label}
            </Link>
          ))}
        </div>
        {items.length ? <ComponentGrid items={items} /> : <p className="border-t border-border pt-10 text-sm text-muted-foreground">Nothing here yet.</p>}
      </div>
      <Aside />
    </div>
  )
}
