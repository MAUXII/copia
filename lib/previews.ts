export type PreviewTheme = "dark" | "light"

/** Every component ships a dark preview (`<slug>.*`) and a light one (`<slug>-light.*`). */
export const PREVIEW_THEMES: { theme: PreviewTheme; suffix: string }[] = [
  { theme: "dark", suffix: "" },
  { theme: "light", suffix: "-light" },
]
