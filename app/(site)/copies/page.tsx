import type { Metadata } from "next"
import { ComponentGrid } from "@/components/site/component-grid"
import { getComponents } from "@/lib/registry"

export const metadata: Metadata = {
  title: "Copies",
  description: "Credited recreations of the best interfaces on the web, one file each.",
}

export default function CopiesPage() {
  const items = getComponents().filter((meta) => meta.collection === "copies")
  return (
    <div className="mx-auto max-w-6xl px-4 pt-32">
      <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">
        Copies<span className="font-serif font-light italic">.</span>
      </h1>
      <p className="mt-4 mb-12 max-w-xl text-muted-foreground">
        The best interfaces on the web, recreated as one file each, often with a feature more, and always credited to whoever made them first.
      </p>
      <ComponentGrid items={items} />
    </div>
  )
}
