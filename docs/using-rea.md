# Using REA

[REA (Reverse Engineer Anything)](https://github.com/morluto/rea) is the
investigation engine behind Copia's copying workflow. It lets your agent
inspect a live page — DOM, styles, scripts, libraries, network, screenshots —
and keeps the evidence.

```bash
npx rea-agents setup      # register REA with your agent (Node 22.19+)
```

Restart your agent so the MCP tools appear. Until then, the CLI works:

```bash
npm i -g rea-agents
npm run rea:browser https://site.com/page
rea list-browser-targets http://127.0.0.1:9333
rea analyze-web-bundle http://127.0.0.1:9333 <targetId> --format json
```

Which tool answers which question, plus probes that work without REA:
[REA for UI](../.agents/skills/copy-component/references/rea-for-ui.md).

Example prompt:

> Use REA to investigate the toolbar tooltip on vercel.com: which elements
> make it, which library animates it, and the spring values. Then rebuild it
> following Copia's copy-component skill.
