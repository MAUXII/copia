"use client"

import { Check, Copy } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export function CopyButton({ value, label = "Copy", className, children }: { value: string; label?: string; className?: string; children?: React.ReactNode }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : label}
      onClick={async () => {
        await navigator.clipboard.writeText(value)
        setCopied(true)
        clearTimeout(timer.current)
        timer.current = setTimeout(() => setCopied(false), 1500)
      }}
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-highlight",
        className,
      )}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {children && <span>{copied ? "Copied" : children}</span>}
    </button>
  )
}

export function CommandLine({ command, className }: { command: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 rounded-lg border bg-card py-1.5 pr-1.5 pl-4 font-mono text-sm", className)}>
      <code className="min-w-0 flex-1 truncate text-muted-foreground">
        <span className="select-none text-foreground/40">$ </span>
        {command}
      </code>
      <CopyButton value={command} label="Copy command" />
    </div>
  )
}
