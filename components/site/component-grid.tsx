"use client"

import Link from "next/link"
import { Search } from "lucide-react"
import { useState } from "react"
import { filterComponents } from "@/lib/filter"
import type { Meta } from "@/lib/schema"
import { CategoryTabs } from "./category-tabs"
import { ComponentCard } from "./component-card"

export function ComponentGrid({ items }: { items: Meta[] }) {
  const [category, setCategory] = useState("all")
  const [query, setQuery] = useState("")
  const visible = filterComponents(items, category, query)

  return (
    <section id="components" className="scroll-mt-16">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CategoryTabs value={category} onChange={setCategory} />
        <label className="flex h-9 items-center gap-2 rounded-lg border bg-card px-3 text-sm sm:w-64">
          <Search className="size-4 text-muted-foreground" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search components"
            aria-label="Search components"
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>
      {visible.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((meta) => (
            <ComponentCard key={meta.slug} meta={meta} />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Nothing here yet.{" "}
          <Link href="/requests" className="text-highlight underline-offset-4 hover:underline">
            Request it
          </Link>
          .
        </p>
      )}
    </section>
  )
}
