import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, ThumbsUp } from "lucide-react"
import { CopyButton } from "@/components/site/copy-button"
import { RequestForm } from "@/components/site/request-form"
import { buildRequestPrompt } from "@/lib/prompt"
import { getComponents } from "@/lib/registry"
import { getRequests, type Request } from "@/lib/requests"
import { REPO_URL } from "@/lib/site"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Requests",
  description: "Components people want copied. Vote for one, or build it with your agent.",
}

// Votes live on GitHub; refresh the page every 10 minutes.
export const revalidate = 600

function hostname(url: string) {
  return new URL(url).hostname.replace(/^www\./, "")
}

function Row({ request, slug }: { request: Request; slug?: string }) {
  return (
    <li className={cn("flex gap-4 py-5", request.done && "opacity-60")}>
      <a
        href={request.url}
        target="_blank"
        rel="noreferrer"
        title="Vote with 👍 on GitHub"
        className="flex h-12 w-11 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl bg-muted text-xs tabular-nums transition-colors hover:bg-[#ff4d1c]/15 hover:text-[#ff7a45]"
      >
        <ThumbsUp className="size-3.5" aria-hidden />
        {request.votes}
      </a>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="font-medium">{request.title}</span>
        {request.description && <p className="line-clamp-2 text-sm text-muted-foreground">{request.description}</p>}
        <p className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
          {request.reference && (
            <a href={request.reference} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 hover:text-foreground">
              {hostname(request.reference)}
              <ArrowUpRight className="size-3" aria-hidden />
            </a>
          )}
          <a href={`https://github.com/${request.by}`} target="_blank" rel="noreferrer" className="hover:text-foreground">
            by @{request.by}
          </a>
          <a href={request.url} target="_blank" rel="noreferrer" className="hover:text-foreground">
            #{request.number}
          </a>
        </p>
      </div>
      <div className="flex shrink-0 items-start">
        {request.done ? (
          slug ? (
            <Link href={`/c/${slug}`} className="text-sm text-highlight underline-offset-4 hover:underline">
              Built →
            </Link>
          ) : (
            <span className="text-sm text-muted-foreground">Done</span>
          )
        ) : (
          <CopyButton
            value={buildRequestPrompt(request)}
            label="Copy a prompt to build it with your agent"
            className="h-8 w-auto gap-1.5 rounded-lg bg-[#ff4d1c]/10 px-3 text-xs text-[#ff7a45] hover:bg-[#ff4d1c]/20"
          >
            Build it
          </CopyButton>
        )}
      </div>
    </li>
  )
}

export default async function RequestsPage() {
  const requests = await getRequests()
  // Closed requests link to the component that fulfilled them.
  const built = new Map(getComponents().flatMap((meta) => (meta.request ? [[meta.request.issue, meta.slug] as const] : [])))

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 pt-32 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0">
        <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">
          Wanted<span className="font-serif font-light italic">.</span>
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Components people want copied. Vote with 👍 on the ones you want too, or pick one and press <span className="text-foreground">Build it</span>: it copies a prompt that
          has your agent recreate it with Copia&apos;s skill and open the pull request.
        </p>

        {requests === null ? (
          <p className="mt-10 text-sm text-muted-foreground">
            Could not reach GitHub right now. See the requests on{" "}
            <a href={`${REPO_URL}/issues?q=label%3Asuggestion`} className="text-highlight underline-offset-4 hover:underline">
              GitHub
            </a>
            .
          </p>
        ) : requests.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">No requests yet. Be the first.</p>
        ) : (
          <ul className="mt-8 divide-y">
            {requests.map((request) => (
              <Row key={request.number} request={request} slug={built.get(request.number)} />
            ))}
          </ul>
        )}
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <h2 className="mb-4 font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">New request</h2>
        <RequestForm />
        <p className="mt-6 text-sm text-muted-foreground">
          Built it already?{" "}
          <Link href="/publish" className="text-foreground underline-offset-4 hover:underline">
            Publish it
          </Link>
          .
        </p>
      </aside>
    </div>
  )
}
