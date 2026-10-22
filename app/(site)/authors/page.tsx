import type { Metadata } from "next"
import Link from "next/link"
import { Avatar } from "@/components/site/avatar"
import { avatarUrl, getPeople } from "@/lib/authors"

export const metadata: Metadata = {
  title: "Authors",
  description: "Everyone Copia credits or who recreated a component, each with their own page.",
}

export default function AuthorsPage() {
  const people = getPeople()
  return (
    <div className="mx-auto max-w-6xl px-4 pt-32">
      <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">
        The <span className="font-serif font-light italic">people</span> behind it.
      </h1>
      <p className="mt-4 max-w-xl text-muted-foreground">Who made the originals and who recreated them. Every credit gets a page; if one is yours, claim it.</p>
      <ul className="mt-12 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((person) => (
          <li key={person.handle}>
            <Link href={`/@${person.handle}`} className="flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-muted">
              <Avatar src={avatarUrl(person)} name={person.name} className="size-11 rounded-xl text-sm" />
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium">{person.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  @{person.handle} · {person.made.length + person.inspired.length} {person.made.length + person.inspired.length === 1 ? "component" : "components"}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
