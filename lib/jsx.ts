import type { Control } from "./schema"

export type ControlValues = Record<string, number | boolean | string>

export function componentName(slug: string) {
  return slug.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase())
}

export function defaultValues(controls: Control[]): ControlValues {
  return Object.fromEntries(controls.map((c) => [c.prop, c.default]))
}

/** JSX for the current customizer values, one prop per line. */
export function generateJsx(name: string, controls: Control[], values: ControlValues): string {
  const lines = controls.map((c) => {
    const value = values[c.prop] ?? c.default
    if (typeof value === "boolean") return value ? `  ${c.prop}` : `  ${c.prop}={false}`
    if (typeof value === "number") return `  ${c.prop}={${value}}`
    return `  ${c.prop}="${value}"`
  })
  return [`<${name}`, ...lines, "/>"].join("\n")
}
