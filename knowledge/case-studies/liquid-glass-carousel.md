# Liquid Glass Carousel

## Sources
- Primary: [liquid-glass-carousel](https://github.com/Yousuf-developer/liquid-glass-carousel) by Yousuf Soomro (MIT), the glass lens and the snap-scrolling row ([demo](https://yousuf-portfolio-carousel.vercel.app)).
- Code: [Componentry's Liquid Glass Carousel](https://componentry.dev/docs/components/liquid-glass-carousel) by Harsh Jadhav (MIT, three.js + GSAP), registry item `https://componentry.dev/r/liquid-glass-carousel.json`.

## Mechanism
- Two passes in three.js. Photo planes in an orthographic scene render into a
  render target; a full-screen shader shows that texture through a lens.
- The lens is an ellipse (`0.565 × 1` in height units, aspect-corrected)
  rotated 65°. Inside it:
  - rim swirl: past `nd = 0.578` the UV is pushed along the tangent by
    `sin(2θ)·0.55 + sin(θ)·0.25`, times `0.6 · r`;
  - dispersion: 16 taps along the radius, spread `offset · 11 · 0.004`,
    weighted with three Gaussians (σ 0.38) at t = 0, 0.5, 1 for R, G, B;
  - a white "nova" glow, a blue ring at radius 0.49 (width 0.014, aura 6×
    wider at 28%) that shimmers `sin(12θ + 3.5t)` by 12%, a thin bright line
    at 0.488.
- The glow is added onto a **white page**, where it clips to white and only
  shows over photos: that is the "peeled glass" look. On a dark background the
  same maths draws a giant glowing ellipse, so keep `background` light.
- The row repeats (4 pools of meshes). Wheel `deltaY × 1.4`, mouse drag
  `× 1.6` (touch `× 1`), flick friction 0.865 per frame, snap to the nearest
  slot after 120 ms idle; scroll follows with 0.09 (snap 0.05, touch 0.22).
  Speed shrinks the panels up to 25%.
- Focus (click the centred photo): it scales to 1.18 (0.9 s, power3.out), the
  others drop 1.4 screen heights in a stagger (0.7 s, power4.out, 0.06 s per
  rank) and the lens effects fade (0.85 s).
- Entry: panels rise from below at 80 px tall, then grow to full size from
  the centre out (2.15 s, expo.inOut) while the lens blooms (1.4 s).

## What Copia changed or added
- **The original code is kept as is.** A first rebuild in raw WebGL (no
  three.js or GSAP) drifted from the look, so Copia now ships Componentry's
  code and allows `three` and `gsap` as dependencies.
- The WebGL error boundary is inlined (one file per component).
- `lens`: override any lens setting (size, rotation, dispersion, ring, rim
  swirl, shimmer, glow…), memoised by value so it does not rebuild the scene.
- `lensColor`: the ring colour without spelling out `lens.blueColor`.
- `autoplay`: steps forward every N seconds, pauses 4 s after any input.

## Known differences from the original
- None in behaviour; only the three props above.
