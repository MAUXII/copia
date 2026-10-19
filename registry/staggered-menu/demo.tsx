"use client"

import { useEffect, useState } from "react"
import { StaggeredMenu } from "./staggered-menu"

const links = [
  { label: "Sydney", href: "#sydney", meta: "21.1k" },
  { label: "Melbourne", href: "#melbourne", meta: "15.2k" },
  { label: "Brisbane", href: "#brisbane", meta: "10.3k" },
  { label: "Mumbai", href: "#mumbai", meta: "8.4k" },
  { label: "Los Angeles", href: "#la", meta: "6.5k" },
  { label: "London", href: "#london", meta: "2.7k" },
]
const footer = [
  { label: "Privacy", href: "#privacy" },
  { label: "Terms", href: "#terms" },
  { label: "PT · EN · ES", href: "#lang" },
]

export default function Demo() {
  const [open, setOpen] = useState(false)
  const [auto, setAuto] = useState(true)

  useEffect(() => {
    if (!auto) return
    const first = setTimeout(() => setOpen(true), 500)
    const id = setInterval(() => setOpen((o) => !o), 2600)
    return () => {
      clearTimeout(first)
      clearInterval(id)
    }
  }, [auto])

  return (
    <div className="relative h-[310px] w-[300px] overflow-hidden rounded-2xl bg-black p-2">
      <div aria-hidden className="absolute inset-x-0 top-16 text-[44px] leading-[0.9] font-black tracking-tighter whitespace-nowrap text-[#ff2a1f] uppercase">
        <p>Run darker</p>
        <p>Seoul 10k</p>
        <p>May 2027</p>
        <p>9:00pm</p>
      </div>
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#ff2a1f]/60 to-transparent" />
      <StaggeredMenu
        links={links}
        footer={footer}
        open={open}
        onOpenChange={(next) => {
          setAuto(false)
          setOpen(next)
        }}
      />
    </div>
  )
}
