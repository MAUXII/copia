# Copia — agent guide

Copia is a free, open-source copying machine for UI components. Most
components here are recreations of the best interfaces on the web: we reverse
engineer them, rebuild each as one file, often add a feature, and credit
everyone. The website is the showcase; this repository is the machine.

## The core: copy a component

To copy, recreate or "make one like" any component, follow
**[`.agents/skills/copy-component/SKILL.md`](.agents/skills/copy-component/SKILL.md)**.

It walks through: find every good version → investigate how it works (with
[REA](https://github.com/morluto/rea) when available) → rebuild it the Copia
way → add a feature → preview → check → credit → case study → pull request.

## The other core: craft a component

Copia also makes its own pieces, the **Components** collection (the site's
`/components`): small, clean interactions that morph and settle. To create
one from scratch rather than copy, follow
**[`.agents/skills/craft-component/SKILL.md`](.agents/skills/craft-component/SKILL.md)**
(`"collection": "craft"` in `meta.json`). That skill is also Copia's style:
every Craft piece follows it. AI-interface pieces (prompts, streaming,
agent status) use the same skill with `"collection": "agents"`. Copies are
`"collection": "copies"`, the default.

To only look for options without building, use
[`.agents/skills/find-component/SKILL.md`](.agents/skills/find-component/SKILL.md).

## The brain

- [`.agents/skills/copy-component/references/techniques.md`](.agents/skills/copy-component/references/techniques.md):
  how effects are made, with the numbers. Read before building; add to it after.
- [`knowledge/case-studies/`](knowledge/case-studies/): one write-up per
  component (sources, mechanism, what we changed).
- [`.agents/skills/copy-component/references/sources.md`](.agents/skills/copy-component/references/sources.md):
  where and how to search.

## People

Everyone Copia credits or who recreates a component gets a page at
`/@<handle>`, built from `meta.json` (`author.github`, `inspiration.handle`,
`credits[].handle`) and `authors/<handle>.json`. A page without
`"claimed": true` shows "Is this yours? Claim it", which opens a pull request
from the person's own GitHub account. See
[crediting](.agents/skills/copy-component/references/crediting.md).

## Commands

```bash
npm install
npm run new <slug> [category]   # scaffold registry/<slug>/ (buttons, text, cards, navigation, effects)
npm run dev              # site at http://localhost:3000 (/c/<slug>, /preview/<slug>)
npm run preview <slug>   # record public/previews/<slug>.webp/.mp4 (dark) and <slug>-light.webp/.mp4 (no registry step needed;
                         # set PREVIEW_BASE_URL to reuse a dev server that already has the component)
npm run check            # validate every component (must pass before a PR)
npm run lint             # eslint (must pass before a PR)
npm test                 # unit tests for the tooling
```

## What you may change

- Yes: add a component, improve an existing one, fix a bug, extend the
  references and case studies.
- Ask first (open an issue): the site (`app/`, `components/site/`), the
  tooling (`scripts/`, `lib/`), configuration.

## Definition of done for a component

`npm run check` passes, which means: the folder has exactly `<slug>.tsx`,
`demo.tsx` and `meta.json`; the slug is kebab-case and matches `meta.slug`;
`meta.json` is valid and has `inspiration`; imports are limited to `react`,
`motion`, `motion/react`, `lucide-react`, `@/lib/utils`, plus `three` and
`gsap` for WebGL pieces (and `./<slug>` in the demo), and used packages are
listed in `dependencies`; every colour the component uses is a prop
(default: the reference's own colour, not Copia's orange) with a
`{ "type": "color" }` control, so the viewer shows a colour picker, and no
hard-coded colour classes such as `bg-[#ff4d1c]`; the component and its demo
follow the theme: switching the viewer to light or dark must turn the
background, text, borders, pills and every surface light or dark (use
`bg-background`, `text-foreground`, `border-border`, `bg-muted`… or the
`dark:` variant, never a fixed page colour like `bg-[#f5f4f3]` or
`text-black`; a WebGL or canvas piece that needs a hex reads the theme's
computed colour and updates when the theme class changes); every component has
two previews, a dark one (`<slug>.webp/.mp4`) and a light one
(`<slug>-light.webp/.mp4`), both recorded by `npm run preview`, at 1280x800,
the mp4s 3–8 s without audio; the site shows the one that matches the reader's
theme. `npm run lint` and
`npx tsc --noEmit` pass (CI runs both). Also expected: a case study and at
least one feature beyond the reference.
