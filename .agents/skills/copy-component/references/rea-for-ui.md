# REA for UI components

[REA](https://github.com/morluto/rea) (Reverse Engineer Anything) connects
your agent to reverse-engineering tools through MCP. For UI work, its browser
tools let you inspect a live page the way a senior engineer would with
DevTools, and keep the evidence.

## Setup

```bash
npx rea-agents setup
```

REA needs Node.js 22.19+ (or 24.11+). Setup registers the MCP server with
your agent and installs REA's own skill; restart the agent afterwards. Website
analysis attaches to a Chrome-family browser through the Chrome DevTools
Protocol, so start Chrome with remote debugging when REA asks for it.

If REA is not available, do the same investigation with DevTools and page
JavaScript. The workflow is identical; you just keep the evidence yourself.

## Using REA from the command line

The MCP tools appear after restarting your agent. The CLI works right away:

```bash
npm i -g rea-agents
npm run rea:browser https://site.com/page      # Chromium with CDP on port 9333
rea list-browser-targets http://127.0.0.1:9333 # copy the page target_id
rea inspect-web-page http://127.0.0.1:9333 <targetId> --format json
rea analyze-web-bundle http://127.0.0.1:9333 <targetId> --format json
rea inspect-web-event-listeners http://127.0.0.1:9333 <targetId> --help
```

Large pages can exhaust Node's memory during bundle analysis; run with
`NODE_OPTIONS=--max-old-space-size=8192`.

When a component's numbers live in JavaScript (springs, durations), search
the page's loaded chunks for a label you saw on screen, then read the
animation values around it:

```js
const urls = performance.getEntriesByType("resource").map((e) => e.name).filter((u) => u.includes(".js"))
for (const u of urls) {
  const text = await (await fetch(u)).text()
  if (text.includes("<label on screen>")) {
    console.log(u, [...text.matchAll(/(stiffness|damping|bounce|mass|duration):\s*[\d.]+/g)].map((m) => m[0]))
  }
}
```

## Which tool answers which question

| Question | REA tool | Without REA |
|---|---|---|
| Which elements and styles make the effect? | `inspect_web_page` (DOM, computed styles, resources) | DevTools Elements; `getComputedStyle` |
| Which library animates it (Motion, GSAP, Lottie, WebGL)? | `analyze_web_bundle` (vendor fingerprints, source maps) | Sources panel; search bundles for `gsap`, `framer`, `three` |
| What changes when I hover, click or scroll? | `observe_web_session` while you interact | Record with DevTools Performance; watch class/style changes |
| Before and after states | `capture_web_screenshot` | Screenshots |
| How close is my recreation? | `compare_web_screenshots` (reference vs. `/preview/<slug>`) | Side-by-side screenshots |
| Scripts to read offline | `export_web_scripts` then static JavaScript analysis | Save sources |

## Quick probes (work with or without REA)

Run in the page console to find the usual suspects:

```js
// Every element using backdrop blur, with its mask
[...document.querySelectorAll("*")].map((e) => [e, getComputedStyle(e)])
  .filter(([, s]) => s.backdropFilter !== "none")
  .map(([e, s]) => ({ el: e, blur: s.backdropFilter, mask: s.maskImage }))

// Elements with transforms or clip-paths (motion targets)
[...document.querySelectorAll("*")].filter((e) => {
  const s = getComputedStyle(e)
  return s.transform !== "none" || s.clipPath !== "none"
})

// Running CSS/WAAPI animations with their timing
document.getAnimations().map((a) => ({ target: a.effect?.target, timing: a.effect?.getTiming() }))
```

## Rules

- Learn the mechanism and the numbers, then write your own implementation.
  Paste nothing you do not understand.
- Keep the evidence (selectors, values, screenshots) in the case study.
