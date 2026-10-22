import { REPO } from "./site"

/** Issues opened from the "Request a component" form carry this label. */
export const REQUEST_LABEL = "suggestion"

export type Request = {
  number: number
  title: string
  url: string
  /** 👍 reactions on the issue: votes. */
  votes: number
  done: boolean
  by: string
  /** "Where did you see it?" from the issue form. */
  reference: string | null
  description: string | null
  createdAt: string
}

type Issue = {
  number: number
  title: string
  html_url: string
  state: string
  body: string | null
  created_at: string
  user: { login: string } | null
  reactions?: { "+1"?: number }
  pull_request?: unknown
}

/** One answer from a GitHub issue form body ("### Label\n\nvalue"). */
function field(body: string, label: string): string | null {
  const match = body.match(new RegExp(`###\\s*${label}[^\\n]*\\n+([\\s\\S]*?)(?=\\n###|$)`))
  const value = match?.[1].trim()
  return value && value !== "_No response_" ? value : null
}

export function toRequest(issue: Issue): Request {
  const body = issue.body ?? ""
  const reference = field(body, "Where did you see it\\?")
  return {
    number: issue.number,
    title: field(body, "Component name") ?? issue.title.replace(/^\[(Suggestion|Request)\]\s*/i, ""),
    url: issue.html_url,
    votes: issue.reactions?.["+1"] ?? 0,
    done: issue.state === "closed",
    by: issue.user?.login ?? "ghost",
    reference: reference && /^https?:\/\//.test(reference) ? reference : null,
    description: field(body, "What does it do\\?"),
    createdAt: issue.created_at,
  }
}

/** Open requests by votes, then the ones already built. */
export function sortRequests(requests: Request[]): Request[] {
  return [...requests].sort((a, b) => Number(a.done) - Number(b.done) || b.votes - a.votes || b.createdAt.localeCompare(a.createdAt))
}

/** Requests from GitHub issues, refreshed every 10 minutes. Returns null when GitHub is unreachable. */
export async function getRequests(): Promise<Request[] | null> {
  try {
    const headers: HeadersInit = { Accept: "application/vnd.github+json" }
    // Optional: a token lifts the 60 requests/hour limit for unauthenticated builds.
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
    const res = await fetch(`https://api.github.com/repos/${REPO}/issues?labels=${REQUEST_LABEL}&state=all&per_page=100`, { headers, next: { revalidate: 600 } })
    if (!res.ok) return null
    const issues = (await res.json()) as Issue[]
    return sortRequests(issues.filter((issue) => !issue.pull_request).map(toRequest))
  } catch {
    return null
  }
}
