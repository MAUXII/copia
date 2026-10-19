# Progressive Blur

## Sources

- Primary reference (the look we copy): Skiper UI skiper41 —
  https://skiper-ui.com/v1/skiper41
- Original idea: Apple, iOS materials and navigation bars —
  https://developer.apple.com/design/human-interface-guidelines/materials
- Studied: Motion Primitives — https://motion-primitives.com/docs/progressive-blur
- Also found via Shoogle (`progressive blur`): Magic UI, Cult UI (Edge Blur),
  React Bits (Gradual Blur).

## Mechanism

Found by reading computed styles on each page (`backdrop-filter`, `mask-image`).

- **Skiper UI skiper41 (the look):** a full-height page of justified text
  (Inter 16px, `text-black/40`, paper background `#f5f4f3`, a small
  "scroll down to see the effect" label with a vertical line). A sticky,
  viewport-height wrapper holds two 150px overlays, top and bottom, so the
  text melts into blur as it scrolls past the edges.
- **Skiper UI (mechanism):** one layer per edge. `backdrop-filter: blur(4px)` or `blur(6px)`,
  `mask-image: linear-gradient(<edge>, <color> 25–50%, transparent)`, about
  120–200px tall, inside a sticky wrapper. The blur radius is constant; only
  its visibility fades.
- **Motion Primitives:** 8 stacked layers. Layer `i` uses `blur(i × step)`
  (steps of 6px, or 0.5px in the subtle variant) and a band mask: transparent
  at `i/9`, opaque from `(i+1)/9` to `(i+2)/9`, transparent at `(i+3)/9`.
  Bands overlap, so the radius really increases toward the edge.

## What Copia changed or added

- Stacked layers (true progressive blur) with configurable count.
- Exponential curve by default (`maxBlur × t²`): stays sharp longer and ramps
  at the edge, closer to iOS than linear steps.
- Any edge (`top`, `bottom`, `left`, `right`).
- `tint` option: a gradient to `var(--background)` on top, which hides
  banding on busy content and blends with the page in both themes.
- `fixed` mode pins the blur to the viewport edges for the page-wide effect
  skiper41 shows, without a sticky wrapper.
- Server component (no client JavaScript).

## Known differences from the original

- iOS also adds vibrancy and saturation; we keep plain blur so it matches any
  theme.
