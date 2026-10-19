import { REPO_URL } from "./site"

export type IssueKind = "suggestion" | "pr-opened"

/** GitHub rejects very long URLs; stay well below its limit. */
export const MAX_ISSUE_URL = 8000

/**
 * Prefilled "new issue" link. Field names must match the `id`s in
 * .github/ISSUE_TEMPLATE/<kind>.yml (GitHub fills issue forms from query params).
 */
export function buildIssueUrl(kind: IssueKind, fields: Record<string, string>): string {
  const params = new URLSearchParams({ template: `${kind}.yml`, ...fields })
  let url = `${REPO_URL}/issues/new?${params}`
  // Shrink the longest field until the URL fits.
  while (url.length > MAX_ISSUE_URL) {
    const [key, value] = [...params.entries()].filter(([k]) => k !== "template").sort((a, b) => b[1].length - a[1].length)[0]
    const overflow = url.length - MAX_ISSUE_URL
    params.set(key, value.slice(0, Math.max(0, value.length - Math.ceil(overflow / 3) - 10)) + "…")
    url = `${REPO_URL}/issues/new?${params}`
  }
  return url
}

export function isValidPrUrl(value: string): boolean {
  const prefix = `${REPO_URL}/pull/`
  const rest = value.trim().replace(/\/$/, "")
  return rest.startsWith(prefix) && /^\d+$/.test(rest.slice(prefix.length))
}
