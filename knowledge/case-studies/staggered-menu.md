# Staggered Menu

## Sources

- Original (credited by Skiper UI as "Nike-inspired"): Nike — https://www.nike.com
- Original: Nike run event pages (mobile menu over a poster).
- Primary reference: Skiper UI skiper13 — https://skiper-ui.com/v1/skiper13
  (preview: https://cdn.skiper-ui.com/video/v1/skiper13.mp4)

## How it was investigated

Preview frame by frame: a dark rounded bar with the logo and "MENU"; tapping
it turns the label into "CLOSE" and unrolls a frosted dark panel from the bar
downward over a huge red poster. City names with superscript counts appear in
red; footer rows (privacy, terms, languages) follow. Closing reverses it.

## Mechanism

- The panel reveals with `clip-path: inset(0 0 100% 0 round 12px)` →
  `inset(0 0 0% 0 …)`, ease `[0.22, 1, 0.36, 1]`, 0.6 s.
- Glass: translucent dark background + `backdrop-filter: blur()` so the poster
  shows through blurred.
- Links stagger in (50 ms apart) from below with blur; on close they leave in
  reverse order before the panel rolls up.
- The MENU / CLOSE label rolls vertically in a clipped slot.

## What Copia changed or added

- Escape closes; `aria-expanded` / `aria-controls`; controlled `open`.
- `accent` color, `logo` and `footer` props; reduced motion uses a fade.
