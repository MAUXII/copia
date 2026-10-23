import { CommandLine } from "@/components/site/copy-button"
import Link from "next/link"
import { ComponentCard } from "@/components/site/component-card"
import { KeysHero } from "@/components/site/keys-hero"
import { GlyphRipple } from "@/components/site/glyph-ripple"
import { Smoke } from "@/components/site/smoke"
import { getComponents } from "@/lib/registry"
import type { Meta } from "@/lib/schema"
import { NAMESPACE } from "@/lib/site"

/** A home section: a heading with a "See all" link and up to six cards. */
function Strip({ title, text, href, items }: { title: string; text: string; href: string; items: Meta[] }) {
  if (!items.length) return null
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-medium tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{text}</p>
        </div>
        <Link href={href} className="shrink-0 text-sm text-muted-foreground transition-colors hover:text-foreground">
          See all →
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((meta) => (
          <ComponentCard key={meta.slug} meta={meta} />
        ))}
      </div>
    </section>
  )
}

export default function Home() {
  const items = getComponents()
  const example = (items.find((m) => m.slug === "dynamic-island") ?? items[0])?.slug ?? "dynamic-island"
  return (
    <>
      {/* The hero follows the theme: white in light, near black in dark. */}
      <section className="relative isolate flex min-h-[640px] items-center justify-center overflow-hidden bg-white px-4 pt-24 pb-20 text-neutral-900 sm:min-h-[760px] dark:bg-[#0a0a0b] dark:text-neutral-50">
        {/* A faint Ember smoke rising from the bottom edge, under the glyphs. */}
        <Smoke className="absolute inset-0 -z-10 size-full opacity-[0.12] [mask-image:linear-gradient(to_top,black,transparent_75%)]" />
        {/* Click anywhere: the glyph grid answers with a wave (like the Claude desktop background). */}
        <GlyphRipple className="absolute inset-0 -z-10 size-full" />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_35%,#fff_85%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_35%,#0a0a0b_85%)]" />
        <div className="flex w-full flex-col items-center gap-6 text-center">
          <KeysHero />
          <p className="max-w-sm text-[15px] leading-relaxed text-neutral-500 dark:text-neutral-400">
            Free, open-source recreations of the interfaces you wish you&apos;d built. Credited, one file each.
          </p>
          <CommandLine command={`npx shadcn add ${NAMESPACE}/${example}`} className="mt-2 w-full max-w-sm border-transparent bg-black/[0.04] backdrop-blur dark:border-transparent dark:bg-white/[0.05]" />
        </div>
        <span className="absolute bottom-5 left-6 hidden font-mono text-[11px] tracking-wide text-black/45 dark:text-white/45 sm:block">
          {String(items.length).padStart(2, "0")} COMPONENTS — MIT
        </span>
        <span className="absolute right-6 bottom-5 hidden font-mono text-[11px] tracking-wide text-black/45 dark:text-white/45 sm:block">LAT. &quot;ABUNDANCE&quot;</span>
      </section>
      <div id="components" className="mx-auto flex max-w-6xl flex-col gap-20 px-4 pt-16">
        <Strip title="New craft" text="Copia's own pieces: small interactions that morph and settle. Try them right here." href="/components/craft" items={items.filter((m) => m.collection === "craft").slice(0, 6)} />
        <Strip title="Latest copies" text="The best interfaces on the web, recreated and credited." href="/components/copies" items={items.filter((m) => m.collection === "copies").slice(0, 6)} />
      </div>
    </>
  )
}
