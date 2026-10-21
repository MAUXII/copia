"use client"

import { cn } from "@/lib/utils"
import { generateJsx, type ControlValues } from "@/lib/jsx"
import type { Control } from "@/lib/schema"
import { CopyButton } from "../copy-button"

const TICKS = 10

function label(prop: string) {
  return prop.replace(/([A-Z])/g, " $1").toUpperCase()
}

function format(value: number, step: number) {
  const decimals = (String(step).split(".")[1] ?? "").length
  return value.toFixed(decimals)
}

/** Wide slider with tick marks and the value on the right, like Great UI's customizer. */
function Slider({ control, value, onChange }: { control: Extract<Control, { type: "number" }>; value: number; onChange: (v: number) => void }) {
  const ratio = (value - control.min) / (control.max - control.min)
  return (
    <div className="relative h-8 overflow-hidden rounded-lg bg-white/[0.05]">
      <div className="absolute inset-y-0 left-0 bg-white/[0.07]" style={{ width: `${ratio * 100}%` }} />
      {Array.from({ length: TICKS - 1 }, (_, i) => (
        <span key={i} aria-hidden className="absolute top-1/2 h-2 w-px -translate-y-1/2 bg-white/15" style={{ left: `${((i + 1) / TICKS) * 100}%` }} />
      ))}
      <span aria-hidden className="absolute top-1/2 h-4 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80" style={{ left: `${ratio * 100}%` }} />
      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 font-mono text-xs text-[#ffc48a]">{format(value, control.step)}</span>
      <input
        type="range"
        aria-label={control.prop}
        min={control.min}
        max={control.max}
        step={control.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 cursor-ew-resize opacity-0"
      />
    </div>
  )
}

function Switch({ checked, onChange, labelText }: { checked: boolean; onChange: (v: boolean) => void; labelText: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={labelText}
      onClick={() => onChange(!checked)}
      className={cn("relative h-6 w-10 rounded-full transition-colors", checked ? "bg-[#ff4d1c]" : "bg-white/15")}
    >
      <span className={cn("absolute top-1 left-1 size-4 rounded-full bg-white transition-transform", checked && "translate-x-4")} />
    </button>
  )
}

/** Colors the generated JSX the same way the code blocks do. */
function ColoredJsx({ code }: { code: string }) {
  return (
    <>
      {code.split("\n").map((line, i) => {
        const tag = line.match(/^(<\/?)(\w+)$|^(\/>)$/)
        if (tag) return <div key={i}><span className="text-neutral-500">{tag[1] ?? tag[3]}</span><span className="text-[#7ee8e2]">{tag[2] ?? ""}</span></div>
        const attr = line.match(/^(\s+)(\w+)(?:=(.*))?$/)
        if (!attr) return <div key={i}>{line}</div>
        const [, indent, name, value] = attr
        return (
          <div key={i}>
            {indent}
            <span className="text-[#c9a7ff]">{name}</span>
            {value !== undefined && (
              <>
                <span className="text-neutral-500">=</span>
                <span className={value.startsWith('"') ? "text-[#ffc48a]" : "text-[#ffb86b]"}>{value}</span>
              </>
            )}
          </div>
        )
      })}
    </>
  )
}

export function Customizer({ name, controls, values, onChange, onReset }: { name: string; controls: Control[]; values: ControlValues; onChange: (prop: string, value: ControlValues[string]) => void; onReset: () => void }) {
  const jsx = generateJsx(name, controls, values)
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-7 px-6 pt-24 pb-28">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-xs tracking-[0.14em] text-neutral-500">PROPS CUSTOMIZER</h2>
          <button type="button" onClick={onReset} className="rounded-lg bg-white/[0.06] px-2.5 py-1 font-mono text-xs text-neutral-300 hover:bg-white/10 hover:text-white">
            Reset
          </button>
        </div>
        <p className="text-lg text-neutral-300">Adjust configurable properties for the live preview.</p>
      </div>

      {controls.map((control) => (
        <div key={control.prop} className={cn("flex gap-3", control.type === "boolean" ? "items-center justify-between" : "flex-col")}>
          <span className="font-mono text-xs tracking-wide text-neutral-400">{label(control.prop)}</span>
          {control.type === "number" && <Slider control={control} value={Number(values[control.prop])} onChange={(v) => onChange(control.prop, v)} />}
          {control.type === "boolean" && <Switch checked={Boolean(values[control.prop])} onChange={(v) => onChange(control.prop, v)} labelText={control.prop} />}
          {control.type === "select" && (
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={control.prop}>
              {control.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={values[control.prop] === option}
                  onClick={() => onChange(control.prop, option)}
                  className={cn("rounded-lg px-3 py-1.5 font-mono text-xs transition-colors", values[control.prop] === option ? "bg-[#ff4d1c]/15 text-[#ffc48a]" : "bg-white/[0.05] text-neutral-400 hover:text-white")}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs tracking-wide text-neutral-400">GENERATED JSX</span>
          <CopyButton value={jsx} label="Copy generated JSX" className="text-neutral-400 hover:bg-white/10 hover:text-white" />
        </div>
        <pre className="overflow-x-auto rounded-xl bg-white/[0.04] p-4 font-mono text-[13px] leading-relaxed text-neutral-300">
          <code>
            <ColoredJsx code={jsx} />
          </code>
        </pre>
      </div>
    </div>
  )
}
