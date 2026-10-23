"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { SegmentedControl } from "@/registry/segmented-control/segmented-control"

type Collection = "all" | "craft" | "copies" | "agents"

const HREF: Record<Collection, string> = { all: "/components", craft: "/components/craft", copies: "/components/copies", agents: "/components/agents" }

/** All / Craft / Copies / Agents, on Copia's own Segmented Control; picking one navigates. */
export function CollectionSwitch({ active }: { active: Collection; counts?: Record<Collection, number> }) {
  const router = useRouter()
  // Move the pill at once; the route catches up.
  const [value, setValue] = useState(active)
  useEffect(() => setValue(active), [active])
  const options = [
    // Four short names fit the 15rem sidebar without icons.
    { value: "all", label: "All" },
    { value: "craft", label: "Craft" },
    { value: "copies", label: "Copies" },
    { value: "agents", label: "Agents" },
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
