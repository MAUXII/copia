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

/** The command with the runner muted and the component in the brand color. */
function ColoredCommand({ manager, target }: { manager: Manager; target: string }) {
  const [runner, ...rest] = MANAGERS[manager].split(" ")
  return (
    <>
      <span className="text-[#ff7a45]">{runner}</span> <span className="text-neutral-400">{rest.join(" ")}</span> <span className="text-[#ffc48a]">{target}</span>
    </>
  )
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
      <code className="min-w-0 flex-1 truncate">
        <ColoredCommand manager={manager} target={target} />
      </code>
      <CopyButton value={command} label="Copy install command" className="text-neutral-400 hover:bg-white/10 hover:text-white" />
    </div>
  )
}

/** The same command as a code block with manager tabs, for the info panel. */
export function InstallTabs({ target }: { target: string }) {
  const [manager, setManager] = useManager()
  const command = installCommand(manager, target)
  return (
    <div className="overflow-hidden rounded-xl bg-white/[0.04]">
      <div className="flex items-center gap-1 px-2 pt-1">
        {(Object.keys(MANAGERS) as Manager[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setManager(m)}
            className={cn("rounded-md px-2.5 py-1.5 text-xs transition-colors", m === manager ? "bg-[#ff4d1c]/15 text-[#ffc48a]" : "text-neutral-500 hover:text-neutral-200")}
          >
            {m}
          </button>
        ))}
        <CopyButton value={command} label="Copy install command" className="ml-auto text-neutral-400 hover:bg-white/10 hover:text-white" />
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-[13px] [scrollbar-width:none]">
        <code>
          <ColoredCommand manager={manager} target={target} />
        </code>
      </pre>
    </div>
  )
}
