"use client"

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react"
import { useId, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export type SegmentedOption = { value: string; label: string; icon?: React.ReactNode }

export type SegmentedControlProps = {
  options: SegmentedOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Accessible name of the group. */
  label?: string
  size?: "sm" | "md"
  /** A short vibration when the selection changes, where supported. */
  haptics?: boolean
  /** "always" shows every label; "active" shows icons only and opens the selected one's label. Needs icons. */
  labels?: "always" | "active"
  className?: string
}

const SLIDE = { type: "spring", bounce: 0.2, duration: 0.45 } as const

/**
 * An Apple-style segmented control: the selected pill slides to the option
 * you pick and stretches a little on the way, the label underneath settles
 * into place. Arrow keys move the selection; it works controlled or not.
 */
export function SegmentedControl({ options, value, defaultValue, onValueChange, label = "Options", size = "md", haptics = true, labels = "always", className }: SegmentedControlProps) {
  const [internal, setInternal] = useState(defaultValue ?? options[0]?.value)
  const selected = value ?? internal
  const group = useId()
  const reduced = useReducedMotion()
  const buttons = useRef<(HTMLButtonElement | null)[]>([])

  const pick = (next: string) => {
    if (next === selected) return
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
    if (haptics) navigator.vibrate?.(3)
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
    if (!step) return
    event.preventDefault()
    const at = options.findIndex((o) => o.value === selected)
    const next = (at + step + options.length) % options.length
    pick(options[next].value)
    buttons.current[next]?.focus()
  }

  return (
    <LayoutGroup id={group}>
      <div
        role="radiogroup"
        aria-label={label}
        onKeyDown={onKeyDown}
        className={cn("inline-flex items-center rounded-full bg-muted p-1", size === "sm" ? "text-xs" : "text-sm", className)}
      >
        {options.map((option, i) => {
          const active = option.value === selected
          const showLabel = labels === "always" || active || !option.icon
          return (
            <button
              key={option.value}
              ref={(el) => {
                buttons.current[i] = el
              }}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={showLabel ? undefined : option.label}
              title={showLabel ? undefined : option.label}
              tabIndex={active ? 0 : -1}
              onClick={() => pick(option.value)}
              className={cn(
                "relative flex items-center gap-1.5 rounded-full font-medium outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]",
                size === "sm" ? "h-7 px-3" : "h-9 px-4",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {active && (
                <motion.span
                  layoutId="pill"
                  transition={reduced ? { duration: 0 } : SLIDE}
                  className="absolute inset-0 z-0 rounded-full bg-background shadow-[0_1px_2px_rgb(0_0_0/0.12),0_0_0_0.5px_rgb(0_0_0/0.06)]"
                />
              )}
              <span className="relative z-10 flex items-center">
                {option.icon && <span className="[&_svg]:size-4">{option.icon}</span>}
                {/* Copia: with labels="active" the label opens and closes, its width animating with the pill. */}
                <AnimatePresence initial={false}>
                  {showLabel && (
                    <motion.span
                      key="label"
                      initial={{ width: 0, opacity: 0, filter: "blur(4px)" }}
                      animate={{ width: "auto", opacity: 1, filter: "blur(0px)" }}
                      exit={{ width: 0, opacity: 0, filter: "blur(4px)" }}
                      transition={reduced ? { duration: 0 } : SLIDE}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      <span className={option.icon ? "pl-1.5" : undefined}>{option.label}</span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
            </button>
          )
        })}
      </div>
    </LayoutGroup>
  )
}
