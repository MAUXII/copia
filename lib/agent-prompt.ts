import { REPO } from "./site"

/** The prompt "Make your own" copies: the person's idea, handed to the agent's skill. */
export function buildAgentPrompt(agent: { skill: string; title: string }, idea: string) {
  const what = idea.trim() || "a component"
  return [
    `Use the ${agent.title} style agent (/${agent.skill}) to make ${what}.`,
    `If the skill is not installed: npx skills add ${REPO} --skill ${agent.skill}`,
    "Follow its steps: decide the states, build one React + Motion + Tailwind file, then screenshot it in light and dark at desktop and phone width and fix what you see.",
  ].join("\n")
}
