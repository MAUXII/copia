# Cursor Trail

## Sources

- Original (credited by Skiper UI): BeFreaky by David Denni — https://www.befreaky.co/
- Original: image cursor trails common on agency and portfolio sites
  (Awwwards).
- Primary reference: Skiper UI skiper18 — https://skiper-ui.com/v1/skiper18
  (preview: https://cdn.skiper-ui.com/video/v1/skiper18.mp4)

## How it was investigated

Watched the preview frame by frame: colorful stickers appear along the
cursor path every few dozen pixels, pop in with a slight rotation, and
shrink away after about a second, so the trail is always 6–10 items long.

## Mechanism

- On `pointermove`, drop an item only after the cursor has travelled
  `spacing` pixels since the last drop (distance, not time, so slow and fast
  movement look the same).
- Each drop is absolutely positioned at the cursor, gets a random rotation,
  enters with a bouncy spring scale 0 → 1, and is removed after `lifetime` ms;
  `AnimatePresence` plays a quick `backIn` shrink on exit.
- A cap (`max`) keeps the DOM small.

## What Copia changed or added

- Any `ReactNode` as an item (images, emoji, components).
- The demo uses BeFreaky's own 12 sticker SVGs (credited to David Denni in
  `meta.json` → `assets`, see `public/demo/cursor-trail/NOTICE.md`); the
  component itself ships no images.
- `spacing`, `lifetime`, `max`, `size` props; disabled for reduced motion.
