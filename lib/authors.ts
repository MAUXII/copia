import { existsSync, readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { getComponents } from "./registry"
import { AuthorSchema, type Author, type Meta } from "./schema"
import { REPO_URL } from "./site"

const DEFAULT_ROOT = "authors"

export type Person = Author & {
  /** Components this person recreated for Copia. */
  made: Meta[]
  /** Components that credit this person as the inspiration or a secondary credit. */
  inspired: Meta[]
  /** First year they appear on Copia. */
  since: number | null
}

function readAuthors(root: string): Map<string, Author> {
  const base = path.join(process.cwd(), root)
  const authors = new Map<string, Author>()
  if (!existsSync(base)) return authors
  for (const file of readdirSync(base).filter((name) => name.endsWith(".json"))) {
    const result = AuthorSchema.safeParse(JSON.parse(readFileSync(path.join(base, file), "utf8")))
    if (!result.success) throw new Error(`Invalid authors/${file}: ${result.error.message}`)
    if (`${result.data.handle}.json` !== file) throw new Error(`authors/${file}: handle must match the file name`)
    authors.set(result.data.handle, result.data)
  }
  return authors
}

/** Everyone with a page: people with an authors/ file plus everyone a component links by handle. */
export function getPeople(registryRoot?: string, authorsRoot = DEFAULT_ROOT): Person[] {
  const files = readAuthors(authorsRoot)
  const people = new Map<string, Person>()
  const person = (handle: string, fallbackName: string, site?: string | null) => {
    let entry = people.get(handle)
    if (!entry) {
      // No file yet: an auto-indexed page built from the credit itself.
      const base: Author = files.get(handle) ?? { handle, name: fallbackName, claimed: false, ...(site ? { site } : {}) }
      entry = { ...base, made: [], inspired: [], since: null }
      people.set(handle, entry)
    }
    return entry
  }
  const note = (entry: Person, meta: Meta, list: "made" | "inspired") => {
    if (!entry[list].includes(meta)) entry[list].push(meta)
    const year = Number(meta.createdAt.slice(0, 4))
    entry.since = entry.since === null ? year : Math.min(entry.since, year)
  }

  for (const meta of getComponents(registryRoot)) {
    note(person(meta.author.github.toLowerCase(), meta.author.name), meta, "made")
    const { inspiration } = meta
    if (inspiration.handle) note(person(inspiration.handle, inspiration.author, inspiration.url), meta, "inspired")
    for (const credit of meta.credits ?? []) if (credit.handle) note(person(credit.handle, credit.author, credit.url), meta, "inspired")
  }
  for (const [handle, author] of files) if (!people.has(handle)) people.set(handle, { ...author, made: [], inspired: [], since: null })

  return [...people.values()].sort((a, b) => b.made.length + b.inspired.length - (a.made.length + a.inspired.length) || a.name.localeCompare(b.name))
}

export function getPerson(handle: string, registryRoot?: string, authorsRoot?: string): Person | null {
  return getPeople(registryRoot, authorsRoot).find((p) => p.handle === handle) ?? null
}

export function avatarUrl(author: Author): string | null {
  return author.avatar ?? (author.github ? `https://github.com/${author.github}.png?size=160` : null)
}

/**
 * "Is this yours? Claim it": opens GitHub with authors/<handle>.json ready to
 * commit. The pull request comes from the person's own account, which is the
 * proof of ownership, so there is no form to review.
 */
export function claimUrl(person: Author, hasFile: boolean): string {
  if (hasFile) return `${REPO_URL}/edit/main/authors/${person.handle}.json`
  const template: Author = { handle: person.handle, name: person.name, bio: "", github: person.handle, site: person.site, claimed: true }
  const value = JSON.stringify(template, null, 2) + "\n"
  return `${REPO_URL}/new/main/authors?filename=${person.handle}.json&value=${encodeURIComponent(value)}`
}

export function hasAuthorFile(handle: string, authorsRoot = DEFAULT_ROOT): boolean {
  return existsSync(path.join(process.cwd(), authorsRoot, `${handle}.json`))
}
