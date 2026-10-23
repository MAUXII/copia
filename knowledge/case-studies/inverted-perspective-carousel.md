# Inverted Perspective Carousel

## Sources
- Primary: [Skiper UI skiper49](https://skiper-ui.com/v1/skiper49) by Gurvinder Singh, which credits "Carousel by Swiper.js" and illustrations by [AarzooAly](https://x.com/AarzooAly). Registry item `https://skiper-ui.com/r/skiper49.json`.
- The effect itself: [Swiper's coverflow](https://swiperjs.com/demos#effect-coverflow) by Vladimir Kharlampidi.
- Copia already has [perspective-carousel](perspective-carousel.md) (skiper47), whose side cards turn the other way and shrink; this one keeps Swiper's coverflow maths.

## Mechanism
- Swiper `effect="coverflow"`, `slidesPerView="auto"`, `centeredSlides`,
  `loop`, slides 300 × 300 (container 350 px tall with 50 px for the dots),
  `spaceBetween` 0, perspective 1200 px.
- `coverflowEffect: { rotate: 40, stretch: 0, depth: 100, modifier: 1, slideShadows: true }`.
  For each slide, `m = (centre − slideCentre) / slideSize × modifier`
  (positive on the left), then `translateZ(−depth·|m|) rotateY(rotate·m)`:
  the left slides turn so their right edge recedes, the right slides mirror it.
- Shadows: two overlays per slide, `linear-gradient(to left|right, rgba(0,0,0,.5), transparent)`,
  opacity `max(m, 0)` and `max(−m, 0)`, so the receding edge darkens with distance.
- Wrapper `max-w-4xl` with overflow hidden, so three slides show and the next
  ones peek in as slivers.

## What Copia changed or added
- **No Swiper.** One `position` MotionValue (float slide index) drives every
  slide through `useTransform`; looping wraps each offset into
  `[−n/2, n/2)`. Drag follows the pointer, a flick projects its velocity
  0.22 s ahead and a spring (260 / 32 / 0.9) snaps to the nearest slide.
- Horizontal wheel and trackpad scroll it, snapping 120 ms after the last
  event.
- Click a side slide or a dot to bring it to the centre the short way round.
- Keyboard: ← / → (the region is focusable, with a live announcement).
- Autoplay pauses while hovered, focused or touched.
- `reflection`: an optional floor mirror (`-webkit-box-reflect`).
- Pagination is the same stretching pill as perspective-carousel (the active
  dot widens to a 16 px pill), in theme colours.

## Known differences from the original
- No rubber-band resistance at the ends when `loop` is off; the position is
  clamped instead.
