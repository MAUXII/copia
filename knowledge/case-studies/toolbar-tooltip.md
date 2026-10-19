# Toolbar Tooltip

## Sources

- Original: Vercel toolbar (vercel.com preview toolbar).
- Primary reference: Skiper UI skiper43 — https://skiper-ui.com/v1/skiper43
  (preview: https://cdn.skiper-ui.com/video/v1/skiper43.mp4)

## How it was investigated

Watched the preview frame by frame: a dark pill toolbar with six icon
buttons. There is only one tooltip. Moving from button to button slides it
sideways and resizes it to fit the new label and its keyboard keys
(`Comment C`, `Menu ⌘ K`). The first tooltip waits a moment; the next ones are
instant. Leaving the toolbar fades it out.

## Mechanism

- One tooltip element for the whole toolbar; its `x` is the hovered button's
  center (`offsetLeft + offsetWidth / 2`), animated with a gentle spring.
- The inner pill uses Motion `layout` so width changes animate; the label
  swaps through `AnimatePresence mode="popLayout"` with a 2px blur crossfade.
- A "warm" flag skips the delay while the pointer stays in the toolbar and
  for 300 ms after leaving.

## What Copia changed or added

- Works with keyboard focus (`onFocus`), `aria-keyshortcuts`, `role="tooltip"`.
- `side` prop (top or bottom) and configurable `delay`.
- Items are data (`label`, `icon`, `shortcut`, `onClick`).
