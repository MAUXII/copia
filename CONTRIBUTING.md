# Contributing to Copia

Thanks for feeding the machine.

- **Want a component?** Request it on the site (/requests) or open a
  [request issue](https://github.com/MAUXII/copia/issues/new?template=suggestion.yml).
  Requests are ranked by 👍 votes; if you build one, add
  `"request": { "issue": <number>, "by": "<their-github>" }` to `meta.json`
  and write "Closes #<number>" in the pull request.
- **Want to build it?** Ask your AI agent to follow [`AGENTS.md`](AGENTS.md), or
  do it by hand with [docs/contributing.md](docs/contributing.md).

Every pull request that adds a component needs: one file in
`registry/<slug>/`, a demo, `meta.json` with credits, generated previews, a
passing `npm run check`, and a case study in `knowledge/case-studies/`.
