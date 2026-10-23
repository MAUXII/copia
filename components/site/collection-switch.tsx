"use client"

import { Copy, LayoutGrid, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { SegmentedControl } from "@/registry/segmented-control/segmented-control"

type Collection = "all" | "craft" | "copies"

const HREF: Record<Collection, string> = { all: "/components", craft: "/components/craft", copies: "/components/copies" }

/** All / Craft / Copies, on Copia's own Segmented Control; picking one navigates. */
export function CollectionSwitch({ active }: { active: Collection; counts?: Record<Collection, number> }) {
  const router = useRouter()
  // Move the pill at once; the route catches up.
  const [value, setValue] = useState(active)
  useEffect(() => setValue(active), [active])
  const options = [
    { value: "all", label: "All", icon: <LayoutGrid /> },
    { value: "craft", label: "Craft", icon: <Sparkles /> },
    { value: "copies", label: "Copies", icon: <Copy /> },
  ]
  return (
    <SegmentedControl
      label="Collection"
      size="sm"
      options={options}
      value={value}
      onValueChange={(next) => {
        setValue(next as Collection)
        router.push(HREF[next as Collection])
      }}
      className="flex w-full [&>button]:flex-1 [&>button]:justify-center [&>button]:px-2 [&>button]:whitespace-nowrap"
    />
  )
}
