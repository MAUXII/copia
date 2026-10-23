import type { Metadata } from "next"
import Link from "next/link"
import { ComponentGrid } from "@/components/site/component-grid"
import { getComponents } from "@/lib/registry"

export const metadata: Metadata = {
  title: "Components",
  description: "Copia's own components: small, clean interactions, made here.",
}

export default function ComponentsPage() {
  const items = getComponents().filter((meta) => meta.collection === "components")
  return (
    <div className="mx-auto max-w-6xl px-4 pt-32">
      <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">
        Components<span className="font-serif font-light italic">.</span>
      </h1>
      <p className="mt-4 mb-12 max-w-xl text-muted-foreground">Copia&apos;s own pieces: small, clean interactions that morph and settle, made here from scratch.</p>
      {items.length > 0 ? (
        <ComponentGrid items={items} />
      ) : (
        <p className="border-t border-border pt-10 text-sm text-muted-foreground">
          The first ones are on the way. Meanwhile, browse the{" "}
          <Link href="/copies" className="text-foreground underline-offset-4 hover:underline">
            Copies
          </Link>
          .
        </p>
      )}
    </div>
  )
}
