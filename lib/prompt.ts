import { NAMESPACE, REPO_URL } from "./site"
import type { Meta } from "./schema"

/** Prompt that hands a request to an agent working in the Copia repo. */
export function buildRequestPrompt(request: { number: number; title: string; url: string; by: string; reference: string | null }): string {
  return [
    `Recreate "${request.title}" for Copia (${REPO_URL}) with the copy-component skill (.agents/skills/copy-component/SKILL.md).`,
    request.reference ? `Reference: ${request.reference}` : "Find the best existing versions first; the request has no reference link.",
    `It was requested in ${request.url}. In meta.json add "request": { "issue": ${request.number}, "by": "${request.by.toLowerCase()}" }, and write "Closes #${request.number}" in the pull request.`,
  ].join("\n")
}

/** Prompt a user can paste into Claude Code, Codex or Cursor to install and adapt a component. */
export function buildPrompt(meta: Meta, registryUrl: string, demoSource: string): string {
  return [
    `Add the "${meta.name}" component from Copia to this project.`,
    "",
    `1. Install it with the shadcn CLI: npx shadcn@latest add ${NAMESPACE}/${meta.slug}`,
    `   If the ${NAMESPACE} namespace is not configured, use the URL: npx shadcn@latest add ${registryUrl}`,
    "2. Keep the component in one file. Adapt its colors to this project's theme (CSS variables / Tailwind tokens) instead of hard-coding new ones.",
    "3. Use it where it fits. Example usage:",
    "",
    "```tsx",
    demoSource.trim(),
    "```",
    "",
    `What it does: ${meta.description}`,
  ].join("\n")
}
