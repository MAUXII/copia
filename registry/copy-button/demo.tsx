"use client"

import { useEffect, useState } from "react"
import { CopyButton, type CopyButtonProps } from "./copy-button"

const COMMAND = "npx shadcn add @copia/copy-button"

/** Plays the copied state on a loop until you click it yourself. */
export default function Demo({ successColor = "#30d158", timeout = 1600 }: Pick<CopyButtonProps, "successColor" | "timeout">) {
  const [auto, setAuto] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!auto || matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let on = false
    const id = setInterval(() => {
      on = !on
      setCopied(on)
    }, 1300)
    return () => clearInterval(id)
  }, [auto])

  return (
    <div className="grid flex-1 place-items-center p-6" onPointerDown={() => setAuto(false)}>
      <div className="flex flex-col items-center gap-4">
        <code className="rounded-lg bg-muted px-3 py-1.5 font-mono text-xs text-muted-foreground">{COMMAND}</code>
        <CopyButton value={COMMAND} copied={auto ? copied : undefined} successColor={successColor} timeout={timeout} />
      </div>
    </div>
  )
}
