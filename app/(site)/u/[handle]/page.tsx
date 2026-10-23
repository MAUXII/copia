import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowUpRight } from "lucide-react"
import { Avatar } from "@/components/site/avatar"
import { ComponentCard } from "@/components/site/component-card"
import { avatarUrl, claimUrl, getPeople, getPerson, hasAuthorFile } from "@/lib/authors"
import type { Meta } from "@/lib/schema"

type Params = { params: Promise<{ handle: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return getPeople().map((person) => ({ handle: person.handle }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const person = getPerson((await params).handle)
  if (!person) return {}
  return { title: `${person.name} (@${person.handle})`, description: person.bio ?? `Components by and inspired by ${person.name} on Copia.` }
}

function OutLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 hover:text-foreground">
      {children}
      <ArrowUpRight className="size-3.5" aria-hidden />
    </a>
  )
}

function Grid({ title, items }: { title: string; items: Meta[] }) {
  if (items.length === 0) return null
  return (
    <section className="flex flex-col gap-5">
      <h2 className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
        {title} · {items.length}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((meta) => (
          <ComponentCard key={meta.slug} meta={meta} />
        ))}
      </div>
    </section>
  )
}

/** Author page: credited people get a page before they ever sign up, and can claim it. */
export default async function AuthorPage({ params }: Params) {
  const person = getPerson((await params).handle)
  if (!person) notFound()

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-14 px-4 pt-32">
      <header className="flex flex-col gap-5">
        <div className="flex items-center gap-6">
          <Avatar src={avatarUrl(person)} name={person.name} seed={person.handle} verified={person.claimed} className="size-32" />
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="truncate text-4xl font-medium tracking-tight">{person.name}</h1>
            <p className="text-sm text-muted-foreground">
              @{person.handle}
              {person.since && ` · since ${person.since}`}
            </p>
          </div>
        </div>

        {person.bio && <p className="text-[15px] leading-relaxed">{person.bio}</p>}

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          {person.made.length > 0 && (
            <span>
              <span className="text-foreground tabular-nums">{person.made.length}</span> recreated
            </span>
          )}
          {person.inspired.length > 0 && (
            <span>
              <span className="text-foreground tabular-nums">{person.inspired.length}</span> credited
            </span>
          )}
          {person.github && <OutLink href={`https://github.com/${person.github}`}>GitHub</OutLink>}
          {person.x && <OutLink href={`https://x.com/${person.x}`}>X</OutLink>}
          {person.site && <OutLink href={person.site}>{new URL(person.site).hostname.replace(/^www\./, "")}</OutLink>}
        </div>

        {!person.claimed && (
          <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            <p>
              Auto-indexed ·{" "}
              <a href={claimUrl(person, hasAuthorFile(person.handle))} target="_blank" rel="noreferrer" className="text-highlight underline-offset-4 hover:underline">
                Is this yours? Claim it
              </a>
            </p>
            <p>
              Copia made this page so the work it credits points back to you. Claiming opens a pull request from your GitHub account with your name, bio and links; that
              pull request is the proof, nothing else to fill in.
            </p>
          </div>
        )}
      </header>

      <Grid title={`Recreated by ${person.name}`} items={person.made} />
      <Grid title={`Credited to ${person.name}`} items={person.inspired} />
      <Grid title={`Requested by ${person.name}`} items={person.requested} />

      <Link href="/authors" className="text-sm text-muted-foreground hover:text-foreground">
        All authors →
      </Link>
    </div>
  )
}
