# Card Stack Scroll

## Sources

- Original: Skiper UI skiper16 (it credits no one) — https://skiper-ui.com/v1/skiper16
- Original: stacked scroll cards popularized by Apple Wallet and many
  landing pages.
- Primary reference: Skiper UI skiper16 — https://skiper-ui.com/v1/skiper16
  (preview: https://cdn.skiper-ui.com/video/v1/skiper16.mp4)

## How it was investigated

Preview frame by frame: "scroll down to see card stack"; image cards scroll
up, stick near the top and pile on each other, each buried card peeking a few
pixels above the next.

## Mechanism

- Each card wrapper is `position: sticky` with `top = base + index × peek`,
  so later cards stop slightly lower and cover earlier ones.
- Scroll progress of the container (`useScroll({ container })`) drives each
  card's `scale` and `brightness` from the moment its successors start
  covering it, so the pile recedes.

## What Copia changed or added

- Self-contained scroll area (`height`), `peek`, `scaleStep`, `cardHeight`.
- Optional `autoScroll` that stops on wheel, touch or pointer down.
- Gradient cards in the demo (no third-party images).
