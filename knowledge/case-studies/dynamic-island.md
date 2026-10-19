# Dynamic Island

## Sources

- Original: Apple, iPhone Dynamic Island (live activities).
- Primary reference: Skiper UI skiper2 — https://skiper-ui.com/v1/skiper2
  (preview video: https://cdn.skiper-ui.com/video/v1/skiper2.mp4)

## How it was investigated

1. Watched the 35 s preview frame by frame (`ffmpeg -vf fps=2,tile=6x4`):
   states are idle pill → "Recording saved" with thumbnail → Ring / Silent
   toggle → timer with rolling digits → recording waveform → expanded music
   player.
2. `rea analyze-web-bundle` on the page (through `npm run rea:browser`):
   Next.js + React, no GSAP or WebGL.
3. Searched the loaded chunks for the state labels and read the animation
   values: springs written as `{ type: "spring", bounce: 0.35–0.5, duration }`,
   content entering with `filter: blur(4px) → blur(0px)`, widths of 200, 220,
   245 and 284px, colors `#2FD057` (call green), `#FDB000` on `#5A3C07`
   (timer amber), `#159BF4` (music blue), `#FD4F30` (silent red).

## Mechanism

- One black container animates `width`, `height` and `borderRadius` with a
  bouncy spring; `overflow: hidden` clips the content while it morphs.
- Each state's content is a separate layer inside `AnimatePresence`
  (`mode="popLayout"`): it enters with opacity 0 → 1, blur 4px → 0 and a small
  scale, and leaves fast (0.15 s) so the morph never shows two states at once.
- Timer digits roll: each digit is keyed by its value and slides in from
  below while the old one exits upward.

## What Copia changed or added

- Controlled API: `view` prop; any change morphs.
- New states: incoming `call` and `notification`.
- `children` + `size` for custom activities.
- Pause/resume and reset on the timer, play/pause on music.
- `role="status"` + `aria-live` so activities are announced; reduced motion
  switches the morph off.

## Known differences

- No "Recording saved" thumbnail state (needs an image asset); the
  notification state covers the same shape.
