# Copia

**A copying machine for UI components.** Free and open source.

Copia (Latin for *abundance*, and the root of "copy") recreates the best
interfaces on the web — Apple's Dynamic Island, Vercel's toolbar, Nike's menu,
iOS progressive blur — as single-file React components you can paste or
install with the shadcn CLI. Every component credits the people who made the
original.

The repository is the machine: agent skills that teach any AI (Claude Code,
Codex, Cursor…) to find a component, reverse engineer it with
[REA](https://github.com/morluto/rea), rebuild it, improve it and credit it.
The website is the showcase of what the machine has copied so far.

## Use a component

```bash
npx shadcn@latest add @copia/dynamic-island
```

Or open any component on the site, copy the code, or copy the ready-made
prompt for your AI editor.

## Copy a new component

Clone the repo and ask your agent:

> Copy the progressive blur from skiper-ui.com and add it to Copia.

Your agent reads [`AGENTS.md`](AGENTS.md) and follows the
[`copy-component`](.agents/skills/copy-component/SKILL.md) skill: it searches
every good version, investigates how it works, rebuilds it as one file, adds a
feature, records the preview, runs the checks and writes a case study. Open a
pull request and it shows up on the site.

To only install the skills (the "brain") into your agent:

```bash
npx skills add MAUXII/copia
```

Prefer to suggest instead? Use the [suggest page](https://copia-ui.vercel.app/suggest)
or [open an issue](https://github.com/MAUXII/copia/issues/new/choose).

## Develop

```bash
npm install
npm run dev              # http://localhost:3000
npm run new <slug>       # scaffold a component
npm run preview <slug>   # record its preview
npm run check            # validate every component
npm test
```

See [docs/](docs/) for installation, contributing, previews, REA and the
credit and removal policy.

## Credit and removal

Most components here are recreations. We credit the original creator and the
versions we studied on every component page and in
[`knowledge/case-studies/`](knowledge/case-studies/). If you made something
here and want the credit changed or the component removed, open a
[removal request](https://github.com/MAUXII/copia/issues/new?template=removal-request.yml).

## License

[MIT](LICENSE)
