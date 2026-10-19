# Token Swap

## Sources

- Original (credited by Skiper UI): Family — https://family.co
- Also credited: micro-interactions from Jakub Krehel — https://jakub.kr
- Original: Aave app swap card (app.aave.com).
- Primary reference: Skiper UI skiper22 — https://skiper-ui.com/v1/skiper22
  (preview: https://cdn.skiper-ui.com/video/v1/skiper22.mp4)

## How it was investigated

Watched the preview frame by frame: an ETH → AAVE card. Typing makes each
new digit rise in with blur; the USD estimate and the received amount
re-animate character by character. "Use Max" fills the balance and flips to
"Using Max"; amounts above the balance show "Not enough ETH" in red; "Clear"
resets.

## Mechanism

- Text is split into characters keyed by `index-char`; when a character
  changes, the old one exits upward with blur and the new one enters from
  below (`AnimatePresence mode="popLayout"`, spring bounce 0.25).
- The real `<input>` sits on top with transparent text and a visible caret,
  so typing, selection and mobile keyboards work natively while the visible
  number is the animated copy.

## What Copia changed or added

- USD ↔ token input toggle.
- Controlled or uncontrolled amount; tokens are data (`symbol`, `balance`,
  `priceUsd`, `color`).
- `AnimatedText` exported for reuse.
