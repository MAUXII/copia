"use client"

import { useEffect, useState } from "react"
import { TokenSwap } from "./token-swap"

/** Types a few amounts on its own until you interact. */
const SCRIPT = ["", "1", "12", "12.5", "12.5", "123", "1234", "1234", "111.82", "111.82", ""]

export default function Demo() {
  const [value, setValue] = useState("")
  const [auto, setAuto] = useState(true)

  useEffect(() => {
    if (!auto) return
    let step = 0
    const id = setInterval(() => {
      step = (step + 1) % SCRIPT.length
      setValue(SCRIPT[step])
    }, 550)
    return () => clearInterval(id)
  }, [auto])

  return (
    <div onPointerDown={() => setAuto(false)} onKeyDown={() => setAuto(false)}>
      <TokenSwap value={value} onValueChange={setValue} />
    </div>
  )
}
