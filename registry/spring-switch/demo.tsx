"use client"

import { useEffect, useState } from "react"
import { SpringSwitch, type SpringSwitchProps } from "./spring-switch"

const SETTINGS = ["Wi-Fi", "Bluetooth", "Airplane mode"]

/** A small settings list that flips itself until you touch it. */
export default function Demo({ onColor = "#34c759" }: Pick<SpringSwitchProps, "onColor">) {
  const [values, setValues] = useState([true, false, false])
  const [auto, setAuto] = useState(true)

  useEffect(() => {
    if (!auto || matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let step = 0
    const id = setInterval(() => {
      const i = step++ % SETTINGS.length
      setValues((v) => v.map((x, j) => (j === i ? !x : x)))
    }, 700)
    return () => clearInterval(id)
  }, [auto])

  return (
    <div className="grid flex-1 place-items-center p-6" onPointerDown={() => setAuto(false)} onKeyDown={() => setAuto(false)}>
      <ul className="flex w-64 flex-col divide-y divide-border rounded-2xl bg-muted/50 px-4">
        {SETTINGS.map((name, i) => (
          <li key={name} className="flex items-center justify-between py-3 text-sm">
            <span>{name}</span>
            <SpringSwitch aria-label={name} checked={values[i]} onCheckedChange={(on) => setValues((v) => v.map((x, j) => (j === i ? on : x)))} onColor={onColor} />
          </li>
        ))}
      </ul>
    </div>
  )
}
