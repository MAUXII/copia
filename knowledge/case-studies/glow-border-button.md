# Glow Border Button

## Sources
- Primary: https://magicui.design/docs/components/border-beam — Magic UI (Border Beam); source read from the registry item https://magicui.design/r/border-beam.json
- Also studied:
  - https://magicui.design/docs/components/shine-border — Magic UI Shine Border (radial gradient sweeping a masked ring, `background-position` animation)
  - https://ryanmulligan.dev/blog/css-property-new-style/ — Ryan Mulligan: `@property --angle` + `conic-gradient(from var(--angle))` on the border box under a padding-box fill (pure CSS, Firefox 128+)
  - https://ui.aceternity.com/components/moving-border — Aceternity Moving Border (SVG `<rect>` + `getPointAtLength` driving a blurred dot)
  - https://dev.to/bittokks/create-animated-borders-using-only-css-3id3 — rotating conic gradient on `::before` with `overflow: hidden`
- Shoogle (`https://shoogle.dev/search?q=border%20beam&tab=search`) was tried but renders results client-side, so a plain fetch returned no results. Original creator unknown; Magic UI's Border Beam is the version that popularised the name ("earliest version found" among libraries).

## Mechanism
- Ring layer: `absolute inset-0 rounded-[inherit]` with a transparent border of `borderWidth` px and
  `mask: linear-gradient(transparent,transparent) padding-box, linear-gradient(#000,#000) border-box; mask-composite: intersect`,
  so only the border band is visible.
- Beam: a square `size` px wide with `background: linear-gradient(to left, colorFrom, colorTo, transparent)`, placed on
  `offset-path: rect(0 auto auto 0 round <size>px)` (the box's own rounded rectangle) and moved by animating
  `offset-distance` 0% → 100%. `offset-rotate: auto` (the default) turns the gradient tail along the path, which is what makes it read as a comet.
- Magic UI numbers: size 50, duration 6 s, linear, infinite, borderWidth 1, colors `#ffaa40` → `#9c40ff`; `delay` is passed negated so beams start mid-lap.
- Triggers: none, it loops forever.

## What Copia changed or added
- **Halo**: a second copy of the beam, `filter: blur(glow px)` at 45% opacity, sits behind an opaque face layer (`-z-10` under `-z-[5]` inside an `isolate` button) so the glow bleeds only outside the edge.
- **Hover/focus boost**: `offset-distance` is driven by `useAnimationFrame` instead of a Motion keyframe loop; the speed multiplier eases toward `hoverSpeed` (default 3x) with a ~180 ms time constant, so the beam accelerates mid-lap instead of restarting (changing `duration` on a Motion animation restarts it).
- Real `<button>` with focus-visible ring, theme tokens (`bg-background`, `var(--border)` resting ring), `reverse`, and a reduced-motion fallback (static gradient ring, no halo, no loop).

## Known differences from the original
- Not a wrapper you drop into any card: it is a button. The ring/beam layers could be extracted if a generic `BorderBeam` is wanted.
- No `initialOffset`/`delay` props (the beam starts at 12%); multiple beams per button are not supported.
- `offset-path: rect()` needs Chrome 116+, Safari 17.2+, Firefox 122+; older browsers show only the resting border.
- Not compared pixel-by-pixel with the reference (REA not connected).
