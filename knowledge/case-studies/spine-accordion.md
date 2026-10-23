# Spine Accordion

## Sources
- Primary: [Crafter UI's Spine Accordion](https://21st.dev/@crafterui/components/spine-accordion) (MIT), registry item `https://crafterui.com/r/spine-accordion.json`. It credits no one.
- Also seen on 21st: Hover Expand, Tailwind Image Accordion, Elastic Gallery (image accordions that widen the hovered panel, all with horizontal titles).

## Mechanism
- The only animated length is `flex-basis`: closed panels ask for one
  spine (`--spine`, 4rem), the open one asks for 100%. Flex shrinks
  everyone in proportion and the spines are floored by
  `min-width: var(--spine)`, so the open panel gets every pixel left, for any
  number of panels, with no measuring.
- 700 ms on `cubic-bezier(0.22, 1, 0.36, 1)`.
- The title runs up the spine with `writing-mode: vertical-rl` plus
  `rotate(180deg)` (no measured rotate box); the year sits at the far end
  and fades in when open.
- The picture is mounted in every panel and only cross-fades (opacity
  700 ms), so opening never waits on a fetch. It is inset by the spine on
  the title side and 0.75 rem elsewhere.
- `@container`: under `@3xl` the shelf turns into stacked rows; flex-basis
  follows the new main axis, so the same rule works vertically.
- Hover opens only for `pointerType === "mouse"`; focus and click open too.

## What Copia changed or added
- Arrow keys (either axis, since it can stack), Home and End move along the
  shelf with a roving tabindex.
- The picture settles from `scale(1.12)` to 1 over 1.4 s as its panel opens.
- `numbered`: 01, 02… beside each title.
- `autoplay`: opens the next piece every N ms, paused on hover, focus or
  touch.
- One file in Copia's style; colours come only from theme tokens.

## Known differences from the original
- None in behaviour beyond the additions.
