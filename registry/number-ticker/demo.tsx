"use client"

import { useEffect, useState } from "react"
import { NumberTicker, type NumberTickerProps } from "./number-ticker"

/** A balance that keeps changing, plus a counter that only goes up. */
export default function Demo({ stagger = 0.04 }: Pick<NumberTickerProps, "stagger">) {
  const [balance, setBalance] = useState(12480.5)
  const [visits, setVisits] = useState(982)

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = setInterval(() => {
      setBalance((b) => Math.max(0, Math.round((b + (Math.random() - 0.4) * 3200) * 100) / 100))
      setVisits((v) => v + Math.ceil(Math.random() * 40))
    }, 1100)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="grid flex-1 place-items-center p-6">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">Balance</span>
          <NumberTicker value={balance} format={{ style: "currency", currency: "USD" }} locale="en-US" stagger={stagger} className="text-5xl font-medium tracking-tight" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">Visits today</span>
          <NumberTicker value={visits} locale="en-US" stagger={stagger} className="text-2xl text-muted-foreground" />
        </div>
      </div>
    </div>
  )
}
