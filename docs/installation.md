# Installing components

Copia components follow shadcn/ui conventions: React, Tailwind CSS and theme
CSS variables. Your project needs shadcn set up (`npx shadcn@latest init`).

## With the shadcn CLI

```bash
npx shadcn@latest add @copia/<slug>
```

If the `@copia` namespace is not available in your CLI yet, use the URL:

```bash
npx shadcn@latest add https://copia-ui.vercel.app/r/<slug>.json
```

The CLI copies one file into your components folder and installs its npm
dependencies (`motion`, `lucide-react` when used).

## By hand

Open the component page, copy the **Code** tab into a file, and install the
packages listed under its dependencies.

## With your AI editor

Every component page has a **Prompt** tab. Paste it into Claude Code, Codex
or Cursor: it installs the component and adapts it to your theme. The
official shadcn MCP server can also install `@copia` items directly.
