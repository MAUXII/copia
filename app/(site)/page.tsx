import { CommandLine } from "@/components/site/copy-button"
import { ComponentGrid } from "@/components/site/component-grid"
import { KeysHero } from "@/components/site/keys-hero"
import { GlyphRipple } from "@/components/site/glyph-ripple"
import { Smoke } from "@/components/site/smoke"
import { getComponents } from "@/lib/registry"
import { NAMESPACE } from "@/lib/site"

export default function Home() {
  const items = getComponents()
  const example = (items.find((m) => m.slug === "dynamic-island") ?? items[0])?.slug ?? "dynamic-island"
  return (
    <>
      {/* The hero is always dark: the dot grid is part of the brand, not the theme. */}
      <section className="dark relative isolate flex min-h-[640px] items-center justify-center overflow-hidden bg-[#0a0a0b] px-4 pt-24 pb-20 text-neutral-50 sm:min-h-[760px]">
        {/* A faint Ember smoke rising from the bottom edge, under the glyphs. */}
        <Smoke className="absolute inset-0 -z-10 size-full opacity-[0.12] [mask-image:linear-gradient(to_top,black,transparent_75%)]" />
        {/* Click anywhere: the glyph grid answers with a wave (like the Claude desktop background). */}
        <GlyphRipple className="absolute inset-0 -z-10 size-full" />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_35%,#0a0a0b_85%)]" />
        <div className="flex w-full flex-col items-center gap-8 text-center">
          <KeysHero />
          <p className="max-w-md text-[15px] leading-relaxed text-neutral-300">
            Free, open-source recreations of the interfaces you wish you&apos;d built. Credited, one file each.
          </p>
          <CommandLine command={`npx shadcn add ${NAMESPACE}/${example}`} className="w-full max-w-md border-white/10 bg-neutral-950/80 backdrop-blur" />
        </div>
        <span className="absolute bottom-5 left-6 hidden font-mono text-[11px] tracking-wide text-white/45 sm:block">
          {String(items.length).padStart(2, "0")} COMPONENTS — MIT
        </span>
        <span className="absolute right-6 bottom-5 hidden font-mono text-[11px] tracking-wide text-white/45 sm:block">LAT. &quot;ABUNDANCE&quot;</span>
      </section>
      <div className="mx-auto max-w-6xl px-4 pt-16">
        <ComponentGrid items={items} />
      </div>
    </>
  )
}
