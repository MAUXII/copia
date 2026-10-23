import Link from "next/link"
import { Copy, LayoutGrid, Sparkles } from "lucide-react"
import { ComponentGrid } from "@/components/site/component-grid"
import { CommandLine } from "@/components/site/copy-button"
import { MakeYourOwn } from "@/components/site/make-your-own"
import { REPO } from "@/lib/site"
import { getComponents } from "@/lib/registry"

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

/** The main column of /components, /components/craft and /components/copies; the sidebar lives in their layout. */
export function Library({ collection }: { collection: Collection }) {
  const all = getComponents()
  const items = collection === "all" ? all : all.filter((m) => m.collection === collection)
  const meta = COLLECTIONS[collection]
  return (
    <div className="min-w-0 pt-10 pb-24">
        <p className="text-sm font-medium">{collection === "all" ? "Library" : "Components"}</p>
        <h1 className="mt-2 text-4xl font-medium tracking-tight">{meta.title}</h1>
        <p className="mt-3 mb-8 max-w-2xl text-muted-foreground">{meta.intro}</p>
        {/* Craft is Copia's style; its skill lets anyone make their own in the same look. */}
        {collection === "craft" && (
          <section className="mb-10 grid gap-4 rounded-2xl bg-muted/50 p-5 lg:grid-cols-2">
            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-medium">Make your own in Copia&apos;s style</h2>
              <p className="text-sm text-muted-foreground">Install the craft skill in your coding agent, then describe what you want.</p>
              <CommandLine command={`npx skills add ${REPO} --skill craft-component`} className="mt-1 w-full" />
            </div>
            <div className="flex flex-col justify-end gap-2">
              <MakeYourOwn />
              <p className="text-xs text-muted-foreground">Copies a prompt for Claude Code, Codex or Cursor.</p>
            </div>
          </section>
        )}
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
  )
}
