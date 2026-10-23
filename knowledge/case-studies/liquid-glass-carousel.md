# Liquid Glass Carousel

## Sources
- Primary: [liquid-glass-carousel](https://github.com/Yousuf-developer/liquid-glass-carousel) by Yousuf Soomro (MIT), the glass lens and the snap-scrolling row ([demo](https://yousuf-portfolio-carousel.vercel.app)).
- Studied: [Componentry's Liquid Glass Carousel](https://componentry.dev/docs/components/liquid-glass-carousel) by Harsh Jadhav (MIT, three.js + GSAP), registry item `https://componentry.dev/r/liquid-glass-carousel.json`.

## Mechanism
- Two passes. The photo row is drawn into an offscreen texture; a full-screen
  shader then shows that texture through a lens.
- The lens is an ellipse (`0.565 × 1` in height units, aspect-corrected)
  rotated 65°. Inside it:
  - rim swirl: past `nd = 0.578` the UV is pushed along the tangent by
    `sin(2θ)·0.55 + sin(θ)·0.25`, times `0.6 · r`;
  - dispersion: 16 taps along the radius, spread `offset · 11 · 0.004`,
    weighted with three Gaussians (σ 0.38) at t = 0, 0.5, 1 for R, G, B;
  - a slight darkening toward the centre (0.91 → 1 over nd 0–0.38);
  - a white "nova" glow, a coloured ring at radius 0.49 (width 0.014, aura
    6× wider at 28%) that shimmers `sin(12θ + 3.5t)` by 12%, and a thin
    bright line at 0.488;
  - edge blend `smoothstep(1, 0.93, dist)`.
- The row repeats forever: each slot is drawn at
  `(slotCenter − scroll) mod totalWidth` plus whole loops.
- Input: wheel `deltaY × 1.4`, mouse drag `× 1.6` (touch `× 1`), flick
  velocity with friction 0.865 per frame, snap to the nearest slot after
  120 ms idle. Scroll follows its goal with 0.09 (snap 0.05, touch 0.22).
- Speed shrinks the panels up to 25% (attack 0.25, decay 0.06), which sells
  the momentum.
- Focus: clicking the centred photo scales it to 1.18 (0.9 s, power3.out),
  drops the others 1.4 screen heights in a stagger (0.7 s, power4.out,
  0.06 s per rank) and fades the lens effects out (0.85 s). Clicking another
  photo scrolls it to the centre first.
- Entry: panels rise from 0.9 screen heights below in a random stagger, then
  the lens blooms (1.4 s).

## What Copia changed or added
- **No three.js and no GSAP.** The two passes are raw WebGL (one textured
  quad shader with a rounded-corner SDF, one lens shader), and the tweens are
  a ten-line timeline. The package goes from two heavy dependencies to none.
- **Autoplay:** steps forward every N seconds and pauses for 4 s after any
  input.
- **Lens colour:** the ring is a prop (Ember by default, the original is a
  fixed blue).
- **Theme-aware background:** the WebGL clear colour is read from the
  component's computed background and re-read when the theme class changes.
- **Glow only where there is an image.** The reference adds its ring and nova
  onto a white page, where they clip to white and only show over photos (the
  "peeled glass" look). On a dark page the same maths draws a giant glowing
  pill, so the glow is masked by how far the refracted colour is from the
  background: `smoothstep(0.03, 0.18, distance(col, bg))`. The ring and the
  rim line use the largest distance among 8 taps 2.2% around the point, so
  their glow spills a little past each image edge (the bright fringe at the
  tips of the folds); the white nova keeps the point-only mask, or every
  photo gets a grey outline.
- **Rounded panels** (`radius`) and **cover-fit** photos of any aspect.
- Keyboard: Enter focuses the centred photo, Escape closes it.

## Known differences from the original
- The entry skips the second phase where panels grow from 80 px tall to
  full size.
- The lens has fixed settings for blur, vignette, zoom and square shape
  (all off in the original's defaults), so they are constants, not props.
