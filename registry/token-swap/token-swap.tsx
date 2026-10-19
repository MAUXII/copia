"use client"

import { useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { ArrowDown, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

export type Token = { symbol: string; name: string; balance: number; priceUsd: number; color: string }

export type TokenSwapProps = {
  from?: Token
  to?: Token
  /** Controlled amount (as typed). */
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}

const ETH: Token = { symbol: "ETH", name: "Ethereum", balance: 111.82, priceUsd: 3445.12, color: "#627eea" }
const AAVE: Token = { symbol: "AAVE", name: "Aave", balance: 0, priceUsd: 316.92, color: "#b6509e" }

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
const amount = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 })

/** Each character slides and un-blurs into place when it changes (keyed by position + value). */
export function AnimatedText({ text, className }: { text: string; className?: string }) {
  const reduceMotion = useReducedMotion()
  return (
    <span className={cn("inline-flex tabular-nums", className)}>
      <span className="sr-only">{text}</span>
      <AnimatePresence mode="popLayout" initial={false}>
        {text.split("").map((char, i) => (
          <motion.span
            key={`${i}-${char}`}
            aria-hidden
            initial={reduceMotion ? false : { y: "0.5em", opacity: 0, filter: "blur(4px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={reduceMotion ? undefined : { y: "-0.5em", opacity: 0, filter: "blur(4px)" }}
            transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
          >
            {char}
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  )
}

function TokenBadge({ token, caption }: { token: Token; caption: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-full text-[11px] font-semibold text-white" style={{ backgroundColor: token.color }}>
        {token.symbol[0]}
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-medium">{token.name}</span>
        <span className="text-xs text-muted-foreground">{caption}</span>
      </span>
    </span>
  )
}

/** Aave-style swap card: typed amounts and every derived number animate digit by digit. */
export function TokenSwap({ from = ETH, to = AAVE, value, onValueChange, className }: TokenSwapProps) {
  const [inner, setInner] = useState("")
  const [inUsd, setInUsd] = useState(false)
  const raw = value ?? inner
  const setRaw = (next: string) => (onValueChange ? onValueChange(next) : setInner(next))

  const numeric = Number(raw) || 0
  const tokens = inUsd ? numeric / from.priceUsd : numeric
  const usdValue = tokens * from.priceUsd
  const received = usdValue / to.priceUsd
  // USD amounts are rounded to cents, so allow half a cent of slack when comparing to the balance.
  const epsilon = inUsd ? 0.005 / from.priceUsd : 1e-9
  const tooMuch = tokens > from.balance + epsilon
  const usingMax = tokens > 0 && Math.abs(tokens - from.balance) <= epsilon

  return (
    <div className={cn("w-80 rounded-3xl border bg-card p-2 text-card-foreground", className)}>
      <div className="rounded-2xl bg-muted/50 p-4">
        <div className="flex items-center justify-between">
          <TokenBadge token={from} caption={`${amount.format(from.balance)} ${from.symbol}`} />
          <button
            type="button"
            onClick={() => setRaw(inUsd ? (from.balance * from.priceUsd).toFixed(2) : String(from.balance))}
            className={cn("rounded-full px-2.5 py-1 text-xs transition-colors", usingMax ? "bg-foreground text-background" : "bg-background text-muted-foreground hover:text-foreground")}
          >
            {usingMax ? "Using max" : "Use max"}
          </button>
        </div>

        <label className="relative mt-5 block text-center">
          <span className="sr-only">Amount in {inUsd ? "USD" : from.symbol}</span>
          <input
            inputMode="decimal"
            value={raw}
            onChange={(e) => {
              const next = e.target.value.replace(/[^\d.]/g, "")
              if (/^\d*\.?\d*$/.test(next)) setRaw(next)
            }}
            placeholder="0"
            className="absolute inset-0 w-full bg-transparent text-center text-4xl font-medium text-transparent caret-foreground outline-none"
          />
          <AnimatedText text={(inUsd ? "$" : "") + (raw || "0")} className="pointer-events-none justify-center text-4xl font-medium" />
        </label>

        <div className="mt-2 flex h-5 items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <AnimatePresence mode="wait" initial={false}>
            {tooMuch ? (
              <motion.span key="error" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="text-destructive">
                Not enough {from.symbol}
              </motion.span>
            ) : (
              <motion.span key="value" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="flex items-center gap-1.5">
                ≈ <AnimatedText text={inUsd ? `${amount.format(tokens)} ${from.symbol}` : usd.format(usdValue)} />
                <button type="button" aria-label="Switch input currency" onClick={() => setInUsd((u) => !u)} className="hover:text-foreground">
                  <ArrowUpDown className="size-3.5" />
                </button>
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="relative z-10 -my-3 flex justify-center">
        <span className="grid size-7 place-items-center rounded-full border bg-card text-muted-foreground">
          <ArrowDown className="size-3.5" />
        </span>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-muted/50 p-4">
        <TokenBadge token={to} caption={`Receive ${to.symbol}`} />
        <AnimatedText text={amount.format(tooMuch ? 0 : received)} className="text-sm font-medium" />
      </div>

      <button type="button" onClick={() => setRaw("")} className="mt-2 h-10 w-full rounded-2xl bg-muted text-sm text-muted-foreground transition-colors hover:text-foreground">
        Clear
      </button>
    </div>
  )
}
