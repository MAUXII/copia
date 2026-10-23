"use client"

import { motion, useReducedMotion } from "motion/react"
import { useId, useState } from "react"
import { cn } from "@/lib/utils"

export type SpringSwitchProps = {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  /** Visible label beside the switch. */
  label?: string
  /** Accessible name when there is no visible label. */
  "aria-label"?: string
  /** Track colour when on (Apple's green by default). */
  onColor?: string
  disabled?: boolean
  /** A short vibration on toggle, where supported. */
  haptics?: boolean
  className?: string
}

const THUMB = { type: "spring", stiffness: 520, damping: 34, mass: 0.7 } as const

/**
 * An iOS-style switch with a spring thumb. Press and hold and the thumb
 * stretches toward where it will go, like the real one; release and it
 * springs across.
 */
export function SpringSwitch({ checked, defaultChecked = false, onCheckedChange, label, "aria-label": ariaLabel, onColor = "#34c759", disabled = false, haptics = true, className }: SpringSwitchProps) {
  const [internal, setInternal] = useState(defaultChecked)
  const [pressed, setPressed] = useState(false)
  const on = checked ?? internal
  const reduced = useReducedMotion()
  const id = useId()

  const toggle = () => {
    if (disabled) return
    if (checked === undefined) setInternal(!on)
    onCheckedChange?.(!on)
    if (haptics) navigator.vibrate?.(4)
  }

  return (
    <span className={cn("inline-flex items-center gap-3", disabled && "opacity-50", className)}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label ? undefined : (ariaLabel ?? "Toggle")}
        disabled={disabled}
        onClick={toggle}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        onKeyDown={(e) => e.key === " " && setPressed(true)}
        onKeyUp={() => setPressed(false)}
        className={cn(
          "relative flex h-[31px] w-[51px] shrink-0 items-center rounded-full p-[2px] outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-ring",
          on ? "justify-end" : "justify-start bg-muted-foreground/30",
        )}
        style={{ background: on ? onColor : undefined }}
      >
        {/* The thumb widens while pressed (toward its destination) and springs on release. */}
        <motion.span
          layout
          transition={reduced ? { duration: 0 } : THUMB}
          animate={{ width: pressed && !reduced ? 34 : 27 }}
          className="block h-[27px] rounded-full bg-white shadow-[0_3px_8px_rgb(0_0_0/0.15),0_1px_1px_rgb(0_0_0/0.16)]"
        />
      </button>
      {label && (
        <label htmlFor={id} className="cursor-pointer text-sm select-none">
          {label}
        </label>
      )}
    </span>
  )
}
