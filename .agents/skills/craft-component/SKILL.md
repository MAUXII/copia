---
name: craft-component
description: Copia's workflow for its own components (the "Components" collection), as opposed to copies. Use when someone wants a new original piece — a small, clean interaction that morphs and settles (a segmented control, a copy button, a switch, a number ticker, a toast stack, a morphing button, a gooey menu that blobs open…) — rather than a recreation of something seen elsewhere. Pins one interaction, designs its states and motion with the feel rules below, builds one Copia file, records light and dark previews, passes `npm run check`, and writes a short craft note.
metadata:
  version: "1"
---

# Craft a component

Copies recreate something that exists; **Components** are Copia's own pieces:
small, quiet, useful interactions in the spirit of Apple's system controls,
Family, Emil Kowalski, Rauno Freiberg and beUI. Each one does **one thing**
and makes it feel physical. Two looks belong here: **morph** (shapes and
content that turn into each other) and **gooey** (shapes that melt and pull
apart like liquid, see below). If what you are asked for already exists
somewhere and the point is to reproduce it, use
[copy-component](../copy-component/SKILL.md) instead.

Work in this order.

## 1. Pin the interaction

One line: what the person does, what the component answers, and the moment
that should feel good ("click copy: the icon morphs into a check and the
button breathes"). If you need two lines, it is two components.

Check `registry/` first: improve an existing piece instead of adding a
near-duplicate.

## 2. Design the states

List every state and how each one becomes the next (idle → hover → pressed
→ busy → done → idle). States **morph** into each other: shared elements
move and resize (`layout`, `layoutId`), content cross-fades with a short blur,
nothing pops in or swaps cold. Write the list in the craft note (step 7).

## 3. Feel rules

- **Springs, not durations,** for anything that moves or resizes
  (`{ type: "spring", bounce: 0.15–0.35, duration: 0.3–0.6 }` or
  stiffness/damping). Opacity and blur may use 150–250 ms eases.
- **Fast in, soft out:** respond within one frame of input; settle gently.
- **Press feedback:** `scale` 0.96–0.98 on press, never more.
- **Blur cross-fades** (4–8 px) when content changes inside the same
  frame (icons, labels, digits).
- **Small distances:** move things 4–16 px, not across the screen.
- **No idle motion** unless it carries meaning (a loading state).
- **Reduced motion:** with `prefers-reduced-motion`, keep the state change,
  drop the travel (`useReducedMotion()`).
- **Keyboard and touch** work as well as the mouse: real buttons and inputs,
  roving focus for groups, arrows where they make sense, visible focus.
- **Accessibility:** the right role (`radiogroup`, `switch`, `status`),
  live announcements for changes the eye would catch.

## 3b. Gooey

Gooey pieces look like liquid: when two shapes get close they fuse with a
soft neck, and they stretch apart before snapping free (a button that drips
a menu out, tabs whose indicator flows from one to the next, a toast that
splits off a pill, a loader of merging dots). Use it where the separation or
joining *is* the moment; it is not a skin for everything.

- **The trick:** render the shapes inside a wrapper with an SVG filter:
  blur them, then push the alpha contrast so the blur's soft edges become a
  single hard edge.
  ```html
  <filter id="goo">
    <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
    <feColorMatrix in="blur" mode="matrix"
      values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9" result="goo" />
    <feComposite in="SourceGraphic" in2="goo" operator="atop" />
  </filter>
  ```
  Apply it with `style={{ filter: "url(#goo)" }}` on the wrapper; give the
  filter a `useId()` id so two instances do not clash.
- **Tune it together:** `stdDeviation` (8–14) sets how far apart shapes
  start to merge; the alpha row `… 0 0 0 a b` (≈ 18–24 and −7 to −10) sets
  how crisp the edge is. More blur needs more contrast.
- **Keep text and icons out of the filter:** it rounds and smears them.
  Put the blobs in the filtered layer and the labels in a layer on top,
  moving with the same springs.
- **Shapes must be solid and the same colour** inside the filter; gradients
  and borders melt into mud. Shadows go on an outer wrapper.
- **Motion:** springs with a little more bounce (0.3–0.45) sell the liquid;
  move blobs apart along one axis so the neck reads.
- **Cost and fallbacks:** filters repaint every frame they animate; keep
  the filtered area small. With reduced motion keep the end states and skip
  the stretch. Safari renders SVG filters on HTML well, but test it.
- The colour of the blobs is a prop with a `color` control, like any other.

Reuse what [techniques](../copy-component/references/techniques.md) already
measured, and add a section when you find a new one.

## 4. Build it the Copia way

Same contract as copies ([copia-contract](../copy-component/references/copia-contract.md)):

```bash
npm run new <slug> <category>
```

- One file, allowed imports only (`react`, `motion` / `motion/react`,
  `lucide-react`, `@/lib/utils`).
- Typed props with defaults, `className` passthrough, controlled and
  uncontrolled where it makes sense (`value` / `defaultValue` /
  `onValueChange`).
- **Colours:** theme tokens by default (`bg-foreground`, `text-background`,
  `bg-muted`…). Any colour that is not a theme token is a prop with a
  `{ "type": "color" }` control. No hard-coded colour classes.
- **Light and dark:** it must look right in both; check the viewer's light
  preview.
- `meta.json`: `"collection": "craft"`, and
  `"inspiration": { "author": "original", "url": null }`. If a system or a
  person's work shaped it (Apple's segmented control, Emil's Sonner), add
  them to `credits` with a `handle`.
- The demo fills the preview area, shows the interaction in about five
  seconds without clicks (auto-cycle states, stop on user input), and takes
  customizer values as props.

## 5. Preview and check

```bash
npm run preview <slug>
npm run check
```

Look at both posters (`<slug>.webp`, `<slug>-light.webp`). Small pieces
look small in a 1280×800 frame: the recorder renders at 2.5× density, so
size the demo for a ~512×320 page.

## 6. Make it better than the obvious version

Before calling it done, add the detail that makes it Copia's: a press
squash, a direction-aware slide, a haptic tick (`navigator.vibrate`), a
number that rolls instead of jumping. Name it in `meta.json` → `description`.

## 7. Craft note

Write `knowledge/case-studies/<slug>.md`: the one-line interaction, the
states and how they morph, the springs and numbers you settled on and why,
and what you tried and dropped.

## 8. Ship

Open a pull request with the template.
