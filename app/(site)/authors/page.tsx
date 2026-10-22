import type { Metadata } from "next"
import Link from "next/link"
import { Avatar } from "@/components/site/avatar"
import { avatarUrl, getPeople, type Person } from "@/lib/authors"

export const metadata: Metadata = {
  title: "Authors",
  description: "Everyone Copia credits or who recreated a component, each with their own page.",
}

const count = (person: Person) => new Set([...person.made, ...person.inspired, ...person.requested]).size

export default function AuthorsPage() {
  const people = getPeople()
  return (
    <div className="mx-auto max-w-2xl px-4 pt-32">
      <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">
        The <span className="font-serif font-light italic">people</span> behind it.
      </h1>
      <p className="mt-4 text-muted-foreground">Who made the originals and who recreated them. Every credit gets a page; if one is yours, claim it.</p>
      <h2 className="mt-12 font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">Everyone · {people.length}</h2>
      <ul className="-mx-3 mt-3 grid gap-1 sm:grid-cols-2">
        {people.map((person) => (
          <li key={person.handle}>
            <Link href={`/@${person.handle}`} className="flex items-center gap-4 rounded-3xl p-3 transition-colors hover:bg-muted">
              <Avatar src={avatarUrl(person)} name={person.name} seed={person.handle} verified={person.claimed} className="size-20" />
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-lg font-medium">{person.name}</span>
                <span className="truncate text-sm text-muted-foreground">
                  @{person.handle} · {count(person)} {count(person) === 1 ? "component" : "components"}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
