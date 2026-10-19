"use client"

import { CATEGORIES } from "@/lib/schema"
import { cn } from "@/lib/utils"

const LABELS: Record<string, string> = {
  all: "All",
  buttons: "Buttons",
  text: "Text",
  cards: "Cards",
  navigation: "Navigation",
  effects: "Effects",
}

export function CategoryTabs({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div role="tablist" aria-label="Category" className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
      {["all", ...CATEGORIES].map((category) => (
        <button
          key={category}
          role="tab"
          aria-selected={value === category}
          onClick={() => onChange(category)}
          className={cn("transition-colors", value === category ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground")}
        >
          {LABELS[category]}
        </button>
      ))}
    </div>
  )
}
