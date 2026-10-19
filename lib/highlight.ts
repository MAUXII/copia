import { createHighlighter, type Highlighter, type ThemeRegistrationRaw } from "shiki"

/** Copia's code palette, built on the Ember brand colors. */
export const EMBER_THEME = {
  background: "#00000000",
  foreground: "#d4d4d4",
  accent: "#ff7a45", // keywords, tags — the brand orange
  peach: "#ffc48a", // strings
  amber: "#ffb86b", // numbers, constants
  teal: "#7ee8e2", // types, components
  lilac: "#c9a7ff", // attributes, props
  muted: "#6b6b6b", // comments, punctuation
}

const theme: ThemeRegistrationRaw = {
  name: "copia-ember",
  type: "dark",
  colors: { "editor.background": EMBER_THEME.background, "editor.foreground": EMBER_THEME.foreground },
  settings: [
    { settings: { foreground: EMBER_THEME.foreground, background: EMBER_THEME.background } },
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: EMBER_THEME.muted, fontStyle: "italic" } },
    { scope: ["keyword", "storage", "storage.type", "storage.modifier", "keyword.control", "keyword.operator.new", "entity.name.tag"], settings: { foreground: EMBER_THEME.accent } },
    { scope: ["string", "string.quoted", "string.template", "punctuation.definition.string"], settings: { foreground: EMBER_THEME.peach } },
    { scope: ["constant.numeric", "constant.language", "constant.character", "support.constant"], settings: { foreground: EMBER_THEME.amber } },
    { scope: ["entity.name.type", "support.type", "support.class", "entity.name.class", "support.class.component", "entity.name.tag.tsx", "variable.other.constant"], settings: { foreground: EMBER_THEME.teal } },
    { scope: ["entity.other.attribute-name", "variable.parameter", "meta.object-literal.key", "support.type.property-name"], settings: { foreground: EMBER_THEME.lilac } },
    { scope: ["entity.name.function", "support.function", "meta.function-call"], settings: { foreground: "#f5f5f5" } },
    { scope: ["punctuation", "meta.brace", "keyword.operator"], settings: { foreground: "#8a8a8a" } },
  ],
}

let highlighter: Promise<Highlighter> | null = null

function getHighlighter() {
  highlighter ??= createHighlighter({ themes: [theme], langs: ["tsx", "bash", "json"] })
  return highlighter
}

/** Server-side syntax highlighting; returns a <pre> element as an HTML string. */
export async function highlightCode(code: string, lang: "tsx" | "bash" | "json" = "tsx"): Promise<string> {
  return (await getHighlighter()).codeToHtml(code.trimEnd(), { lang, theme: "copia-ember" })
}
