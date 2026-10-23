---
name: copy-component
description: Copia's core "xerox" workflow. Use when someone wants to copy, recreate, reverse engineer or "make one like" a UI component they saw anywhere (a product site, Skiper UI, 21st.dev, Aceternity, an Awwwards site, a screenshot or a video). Finds the best existing versions, investigates how they work (with REA when available), rebuilds the component as one Copia file with at least one extra feature, records a preview, passes `npm run check`, credits everyone, and prepares a pull request.
metadata:
  version: "1"
---

# Copy a component

Copia is a copying machine for UI. Most components here are recreations of
the best interfaces on the web: we reverse engineer them, rebuild them as one
file, often add a feature, and credit everyone. This skill is the machine.

Work in this order. Each step has a deliverable; do not skip ahead.

## 1. Pin the target

Restate what is being copied in one line: the component, where it was seen,
and what makes it special (the "trick"). If the user only gave a name
("progressive blur"), that is fine: step 2 finds the candidates.

Check `registry/` and `knowledge/case-studies/` first. If Copia already has
the component, improve it instead of creating a duplicate.

## 2. Find every good version

Search wide before reading code. Follow [sources](references/sources.md):
the original product site, Shoogle (searches ~all shadcn registries at once),
Skiper UI, 21st.dev, Aceternity, Magic UI, Motion Primitives, React Bits,
Cult UI, Codrops, and the web at large.

Deliverable: a shortlist of 2–5 versions with links, one line each on how
they differ. Pick the best as the **primary reference** and note any feature
from the others worth stealing. The `find-component` skill does only this
step when the user just wants options.

## 3. Investigate how it works

Learn the mechanism, not the markup. Follow [REA for UI](references/rea-for-ui.md):

- With REA connected, attach to a browser tab on the reference and use
  `inspect_web_page` (DOM, styles, scripts), `analyze_web_bundle` (libraries,
  source maps), `observe_web_session` while you interact, and
  `capture_web_screenshot` for before/after states.
- Without REA, use the browser's DevTools or page JavaScript to read computed
  styles (`backdrop-filter`, `mask-image`, `transform`, `clip-path`,
  `filter`), the animation timings, and which library drives the motion.
- Watch the preview video frame by frame when the effect is fast.

Deliverable: a short **mechanism note**: layers, the CSS/JS technique, exact
numbers (durations, easings, spring values, blur radii, counts), and what
triggers it. Check [techniques](references/techniques.md): if the trick is
already documented, reuse it; if not, you will add it in step 8.

## 4. Rebuild it the Copia way

Follow the [Copia contract](references/copia-contract.md):

```bash
npm run new <slug>
```

- One file: `registry/<slug>/<slug>.tsx`. Write it from your mechanism note.
- Allowed imports: `react`, `motion` / `motion/react`, `lucide-react`,
  `@/lib/utils`, and `three` / `gsap` for WebGL pieces. Anything else gets
  reimplemented inside the file. When a reference is MIT and already one file,
  keep its code and add props instead of rewriting it.
- Theme colors through CSS variables, `className` passthrough, typed props
  with defaults, keyboard support when interactive, `prefers-reduced-motion`.
- `demo.tsx` shows the component at its best in ~5 seconds of cursor motion
  (the preview recorder moves the pointer in from the left and circles the
  center).
- **The demo fills the whole preview area. Never draw a box, frame, border
  or inner scroll window around it.** Its root is `flex-1` (e.g.
  `grid flex-1 place-items-center` for centered components). If the effect
  needs scrolling, make the demo taller than the screen and let the page
  scroll: components must use the existing scroller (window or scrolling
  parent), never create their own.

### Images in the demo

Never fake photos with gradients or code when the reference uses images.
Use real images, in this order:

1. **The reference's own images** (the stickers on BeFreaky, the covers on
   the original site), when the effect depends on them. Credit the author.
2. **Similar real images from [Lummi](https://www.lummi.ai)** (free for
   personal and commercial use; credit appreciated). Search
   `https://www.lummi.ai/s/photo/<terms>` for a matching look, use only free
   images (`assets.lummi.ai/...`, not `/api/pro/...`), and download a
   resized WebP: `https://assets.lummi.ai/assets/<id>?auto=format&w=800&fm=webp`.

Put files in `public/demo/<slug>/` and credit every one in `meta.json` →
`assets` (`file`, `author`, `source` page, `license`). `npm run check` fails
on any uncredited file. Images belong to the demo only; the component itself
takes images as props.

### Colours are props

Every colour the component uses is a prop. Its default is the colour the
reference uses (blue stays blue: do not swap in Copia's Ember orange), or a
theme token when the reference follows the theme. Apply it through `style`
or a CSS variable, never a hard-coded class like `bg-[#ff4d1c]` (`npm run
check` rejects those), and give it a `{ "prop": "...", "type": "color",
"default": "#rrggbb" }` control so the viewer offers a colour picker.

### Light and dark

The viewer has a light/dark switch and the component must follow it. Use
theme tokens (`bg-background`, `text-foreground`, `text-muted-foreground`,
`border-border`, `bg-muted`, `bg-foreground` for active pills) or the `dark:`
variant, in the component and in the demo. Never pin a page colour
(`bg-[#f5f4f3]`, `bg-white`, `text-black`): it stays put when the theme
flips. Objects that are dark by nature (an iPhone island, a black toolbar)
may stay dark. WebGL and canvas pieces that need a colour value read the
computed theme colour (paint it to a 1 px canvas to get a hex) and redraw
when the `class` of any ancestor changes. Before calling it done, toggle the
viewer's light preview and look.

### Customizer controls

Add `controls` to `meta.json` for the props worth tweaking live and make the
demo accept them as props (see the contract). The viewer then shows a Props
Customizer with sliders, switches and generated JSX.

## 5. Add at least one feature

Copia versions are better than the reference. Typical upgrades: a direction
or variant prop, a smoother curve, keyboard/touch support, reduced-motion
fallback, theming, more states, better performance. Name the upgrade in
`meta.json` → `description`.

## 6. Preview and check

```bash
npm run preview <slug>
npm run check
```

Look at `public/previews/<slug>.webp`. If the effect does not show, fix the
demo, not the recorder. `check` must print `✓ N components OK`; its messages
say the file, the rule and the fix.

When REA is connected, compare your preview page with the reference using
`compare_web_screenshots` and note the differences in the case study.

## 7. Credit everyone

Follow [crediting](references/crediting.md). First read the reference's own
attribution (on Skiper UI: **Show Info → Attribution**) and copy it:
`meta.json` → `inspiration` names whoever the reference credits, and
`credits` lists any secondary names. Only if the reference credits no one is
the reference itself the inspiration. Also credit the version
you studied when it is not the original (for example: original by Apple,
studied via Skiper UI and Motion Primitives).

## 8. Feed the brain

Write `knowledge/case-studies/<slug>.md` (template in
[copia-contract](references/copia-contract.md)): sources, mechanism note,
decisions, what you added, what still differs. If you learned a technique
that is not in [techniques](references/techniques.md), add a section there.
This is how the machine gets smarter with every copy.

## 9. Ship

Open a pull request with the template. If it fulfils a request from
`/requests`, add `"request": { "issue": <number>, "by": "<their-github>" }` to
`meta.json` and write "Closes #<number>" in the pull request.
