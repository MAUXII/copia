import { REPO } from "./site"

/** The prompt "Make your own" copies: the person's idea, handed to Copia's craft skill. */
export function buildCraftPrompt(idea: string) {
  const what = idea.trim() || "a component"
  return [
    `Make ${what} in Copia's style, following the craft-component skill (/craft-component).`,
    `If the skill is not installed: npx skills add ${REPO} --skill craft-component`,
    "Follow its steps: pin the interaction, design the states, build one React + Motion + Tailwind file in Copia's look, then check it in light and dark at desktop and phone width and fix what you see.",
  ].join("\n")
}
