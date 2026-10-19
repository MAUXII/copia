# Where to find components

Search several places. The first result is rarely the best one, and the best
version is often not on a component site at all but on the product that
invented it.

## Search engines

| Source | How to search | Notes |
|---|---|---|
| Shoogle | `https://shoogle.dev/search?q=<terms>&tab=search` | Searches most shadcn registries at once. Start here. Results link to Magic UI, Motion Primitives, Skiper UI, Cult UI, React Bits and dozens more. |
| Web search | `"<effect>" site:codepen.io`, `"<effect>" codrops`, `"<effect>" css` | Finds the original article or demo, often older than any library. |
| X / Twitter | `<effect> from:raunofreiberg`, `from:emilkowalski_`, `from:jh3yy` | Design engineers post the original experiments. |

## Component libraries

| Library | URL pattern | What it is good for |
|---|---|---|
| Skiper UI | `https://skiper-ui.com/v1/skiper<N>`; previews at `https://cdn.skiper-ui.com/video/v1/skiper<N>.mp4` | "Uncommon" recreations of brand interfaces (Apple, Nike, Vercel, Uniswap). Watch the preview video to see the behavior. The component list is at `/components`. |
| 21st.dev | `https://21st.dev/s/<query>` (or `/search?q=`) | Huge community catalog; quality varies. Good for variants. |
| Aceternity UI | `https://ui.aceternity.com/components/<slug>` | Flashy marketing effects. |
| Magic UI | `https://magicui.design/docs/components/<slug>` | Clean, well-typed effects. |
| Motion Primitives | `https://motion-primitives.com/docs/<slug>` | Precise motion; good mechanism references. |
| React Bits | `https://reactbits.dev/<category>/<slug>` | Text and background effects. |
| Cult UI | `https://cult-ui.com/docs/components/<slug>` | Polished product-style components. |
| Build UI | `https://buildui.com/recipes/<slug>` | Recipes with explanations. |

## Originals (where the trick was born)

| Look here for | Examples |
|---|---|
| Apple | apple.com product pages, iOS (Dynamic Island, progressive blur, sheets) |
| Vercel | vercel.com, v0.dev (tooltips, toolbars, gradients) |
| Linear | linear.app (spotlight cards, command menu, timelines) |
| Stripe | stripe.com (gradients, globe, docs nav) |
| Nike | nike.com (menus, preloaders, product grids) |
| Uniswap / Aave | app.uniswap.org, app.aave.com (token selects, swaps, dialogs) |
| Awwwards | awwwards.com sites of the day (cursor trails, reveals, scroll scenes) |
| Rauno Freiberg | rauno.me, devouringdetails.com (micro-interactions) |

## Reading the source of a registry component

Most shadcn-style libraries publish their components as registry JSON. When
the docs page hides the code, fetch the item directly:
`https://<site>/r/<name>.json` (for example
`https://magicui.design/r/border-beam.json`); the `files[].content` field is
the source. Read it to learn the mechanism, then write your own version.

## Search pages that need a browser

Shoogle, Skiper UI and most library catalogs render results with
JavaScript. A plain HTTP fetch returns an empty page; use a real browser
(REA's `npm run rea:browser <url>`, Playwright, or your agent's browser tool).

## Images for demos

| Source | How | License |
|---|---|---|
| The reference itself | Read image URLs from the DOM (`<img>`, `background-image`) | Belongs to its author: demo use with credit only |
| Lummi | `https://www.lummi.ai/s/photo/<terms>`; free files live on `assets.lummi.ai` | Free for personal and commercial use; no reselling or stock-site bundling |

## Writing down what you found

For each candidate: link, author, one line on the mechanism if visible, and
what it does better than the others. Keep the list in the case study.
