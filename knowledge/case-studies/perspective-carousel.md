# Perspective Carousel

## Sources

- Original: Apple Cover Flow (iTunes / macOS Finder).
- Primary reference: Skiper UI skiper47 — https://skiper-ui.com/v1/skiper47
  (preview: https://cdn.skiper-ui.com/video/v1/skiper47.mp4)

## How it was investigated

Preview frame by frame: square album covers in a row; the active cover is
the largest and flat, its neighbours are smaller, slightly turned and darker;
the row slides one step at a time with a soft spring and dots below show the
position.

## Mechanism

- Every card is absolutely positioned at the center and animated from its
  signed distance to the active index (`offset`), computed the short way
  around so the carousel wraps.
- `x = offset × size × spacing`, `scale` 1 for the center and ≈0.82, 0.70…
  for neighbours, `rotateY = -offset × 22°` under a 1200px perspective,
  `brightness(0.7)` off-center, hidden beyond two steps.

## What Copia changed or added

- Drag/swipe (Motion `drag="x"`), arrow keys, clickable cards and dots.
- Autoplay with `pauseOnHover`; reduced motion removes the 3D turn.
- Generated typographic covers in the demo (no third-party images).
