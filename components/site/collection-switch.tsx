"use client"

import { Bot, Copy, LayoutGrid, Sparkles } from "lucide-react"
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
    { value: "all", label: "All", icon: <LayoutGrid /> },
    { value: "craft", label: "Craft", icon: <Sparkles /> },
    { value: "copies", label: "Copies", icon: <Copy /> },
    { value: "agents", label: "Agents", icon: <Bot /> },
  ]
  return (
    <SegmentedControl
      label="Collection"
      labels="active"
      size="sm"
      options={options}
      value={value}
      onValueChange={(next) => {
        setValue(next as Collection)
        router.push(HREF[next as Collection])
      }}
      className="self-start [&>button]:px-2.5"
    />
  )
}
