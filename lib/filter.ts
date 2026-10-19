import type { Meta } from "./schema"

function normalize(text: string) {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
}

export function filterComponents(items: Meta[], category: string, query: string): Meta[] {
  const q = normalize(query.trim())
  return items.filter((meta) => {
    if (category !== "all" && meta.category !== category) return false
    if (!q) return true
    return [meta.name, meta.slug, ...meta.tags].some((field) => normalize(field).includes(q))
  })
}
