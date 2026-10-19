"use client"

import { ChevronsUpDown } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { CopyButton } from "../copy-button"

const MANAGERS = {
  pnpm: "pnpm dlx shadcn@latest add",
  npm: "npx shadcn@latest add",
  yarn: "yarn dlx shadcn@latest add",
  bun: "bunx --bun shadcn@latest add",
} as const
type Manager = keyof typeof MANAGERS

function useManager() {
  const [manager, setManager] = useState<Manager>("pnpm")
  useEffect(() => {
    try {
      const saved = localStorage.getItem("copia:pm") as Manager | null
      if (saved && saved in MANAGERS) setManager(saved)
    } catch {
      // storage blocked: keep the default
    }
  }, [])
  const choose = (next: Manager) => {
    setManager(next)
    try {
      localStorage.setItem("copia:pm", next)
    } catch {}
  }
  return [manager, choose] as const
}

export function installCommand(manager: Manager, target: string) {
  return `${MANAGERS[manager]} ${target}`
}

/** Package-manager picker + install command + copy, as a pill. */
export function InstallCommand({ target, className }: { target: string; className?: string }) {
  const [manager, setManager] = useManager()
  const command = installCommand(manager, target)
  return (
    <div className={cn("flex items-center gap-2 rounded-xl py-1.5 pr-1.5 pl-2 font-mono text-[13px] text-neutral-200", className)}>
      <label className="relative flex items-center">
        <span className="sr-only">Package manager</span>
        <select
          value={manager}
          onChange={(e) => setManager(e.target.value as Manager)}
          className="appearance-none rounded-lg bg-white/10 py-1 pr-6 pl-2.5 font-sans text-xs font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          {Object.keys(MANAGERS).map((m) => (
            <option key={m} value={m} className="bg-neutral-900">
              {m}
            </option>
          ))}
        </select>
        <ChevronsUpDown className="pointer-events-none absolute right-1.5 size-3 text-neutral-400" aria-hidden />
      </label>
      <code className="min-w-0 flex-1 truncate">{command}</code>
      <CopyButton value={command} label="Copy install command" className="text-neutral-400 hover:bg-white/10 hover:text-white" />
    </div>
  )
}

/** The same command as a code block with manager tabs, for the info panel. */
export function InstallTabs({ target }: { target: string }) {
  const [manager, setManager] = useManager()
  const command = installCommand(manager, target)
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
      <div className="flex items-center gap-1 border-b border-white/10 px-2">
        {(Object.keys(MANAGERS) as Manager[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setManager(m)}
            className={cn("-mb-px border-b px-2.5 py-2 text-xs transition-colors", m === manager ? "border-white text-white" : "border-transparent text-neutral-500 hover:text-neutral-200")}
          >
            {m}
          </button>
        ))}
        <CopyButton value={command} label="Copy install command" className="ml-auto text-neutral-400 hover:bg-white/10 hover:text-white" />
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-[13px] text-neutral-300">
        <code>{command}</code>
      </pre>
    </div>
  )
}
