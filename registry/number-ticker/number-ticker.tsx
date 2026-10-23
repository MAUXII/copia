"use client"

import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

export type NumberTickerProps = {
  value: number
  /** Intl.NumberFormat options (currency, decimals, compact…). */
  format?: Intl.NumberFormatOptions
  locale?: string
  /** Seconds between neighbouring digits starting to roll, right to left. */
  stagger?: number
  className?: string
}

const ROLL = { type: "spring", bounce: 0.15, duration: 0.7 } as const
const DIGITS = "0123456789"

/** One column: a strip of 0–9 that rolls to the digit, like an odometer. */
function Digit({ digit, delay, reduced }: { digit: number; delay: number; reduced: boolean }) {
  return (
    <span className="relative inline-block h-[1lh] overflow-hidden">
      {/* Invisible copy of the widest digit keeps the column width stable. */}
      <span className="invisible">0</span>
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col"
        initial={false}
        animate={{ y: `${-digit * 10}%` }}
        transition={reduced ? { duration: 0 } : { ...ROLL, delay }}
      >
        {DIGITS.split("").map((d) => (
          <span key={d} className="h-[1lh]">
            {d}
          </span>
        ))}
      </motion.span>
    </span>
  )
}

/**
 * A number whose digits roll to their new value instead of jumping, each
 * column a little after its right-hand neighbour. Separators, currency and
 * signs from Intl formatting stay put; the full value is announced.
 */
export function NumberTicker({ value, format, locale, stagger = 0.04, className }: NumberTickerProps) {
  const reduced = !!useReducedMotion()
  const text = new Intl.NumberFormat(locale, format).format(value)
  const chars = text.split("")
  // Key columns from the right, so a new leading digit slides in without reshuffling the rest.
  let fromRight = 0
  const keyed = chars
    .map((char) => char)
    .reverse()
    .map((char) => ({ char, slot: /\d/.test(char) ? fromRight++ : -1 }))
    .reverse()

  return (
    <span className={cn("inline-flex tabular-nums", className)} aria-label={text} role="img">
      {keyed.map(({ char, slot }, i) =>
        slot >= 0 ? (
          <Digit key={`d${slot}`} digit={Number(char)} delay={slot * stagger} reduced={reduced} />
        ) : (
          <span key={`s${i}-${char}`} aria-hidden>
            {char}
          </span>
        ),
      )}
    </span>
  )
}
