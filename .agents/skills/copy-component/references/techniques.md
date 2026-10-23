# Techniques

How the effects people copy are actually made. Each entry: the idea, the
numbers that matter, and where it was seen. Add a section whenever a copy
teaches you something new.

## Progressive blur

**Idea.** Blur that grows smoothly toward an edge, like iOS navigation bars.
`backdrop-filter` cannot vary across one element, so stack layers.

**Single-layer version** (seen in Skiper UI skiper41): one element with
`backdrop-filter: blur(4–6px)` and `mask-image: linear-gradient(<edge>, #000
25–50%, transparent)`. Cheap, but the blur is constant where visible; only its
opacity fades.

**Stacked version** (seen in Motion Primitives): `N` layers. Layer `i` has
`backdrop-filter: blur(i × step)` and a mask that is a band:

```
segment = 1 / (N + 1)
mask(i) = linear-gradient(<direction>,
  transparent  i      × segment,
  black       (i + 1) × segment,
  black       (i + 2) × segment,
  transparent (i + 3) × segment)
```

Neighbouring bands overlap, so the eye sees a continuous ramp. Motion
Primitives uses 8 layers and linear steps (0, 6, 12 … 42px or 0, 0.5, 1 …).

**Improvements used in Copia:** exponential steps (`max × (i/N)²`) look more
natural than linear ones; an optional tint gradient on top hides banding on
busy content; any of the four edges.

**Edge bleed.** `backdrop-filter` samples pixels outside its box, so dark
page color leaks into the corners of a light, rounded container. Make the
container a backdrop root, for example `clip-path: inset(0 round 1rem)`, so
the blur only sees its own content.

**Costs.** Each layer re-samples what is behind it. 6–10 layers is the sweet
spot; more is slower without looking better.

## Morphing container (Dynamic Island)

**Idea.** One shape changes size and corner radius while its content swaps,
so it feels like the same object reshaping.

**Mechanism.** Animate `width`, `height`, `borderRadius` on one element with
`overflow: hidden`. Put each state's content in its own layer inside
`AnimatePresence mode="popLayout"`, absolutely positioned. Enter with
opacity + `filter: blur(4px) → 0` + scale 0.92 → 1 after a short delay;
exit fast (≈0.15 s) so states never overlap visibly.

**Numbers.** Skiper UI uses `{ type: "spring", bounce: 0.35–0.5 }`; Copia
uses bounce 0.35, duration 0.55 for the shape and bounce 0.3, delay 0.08 for
content.

**Seen in.** Apple Dynamic Island; Skiper UI skiper2.

**Pitfalls.** Do not combine Motion's `layout` prop with explicit
width/height animation on the same element. Turn the morph off for reduced
motion.

## Rolling digits

**Idea.** Numbers that change roll vertically like an odometer.

**Mechanism.** Render each digit in a fixed-width, `overflow: hidden` slot.
Key the inner element by the digit value inside `AnimatePresence`; enter from
`y: 100%`, exit to `y: -100%`, optional 2px blur in motion.

**Seen in.** Skiper UI skiper2 timer.

## Shared tooltip (one tooltip, many triggers)

**Idea.** A toolbar has one tooltip that glides to whichever button is
hovered, instead of one tooltip per button.

**Mechanism.** Store the active index and the trigger's center
(`offsetLeft + offsetWidth / 2`). Animate the tooltip's `x` to that center
with a spring; give the inner pill Motion `layout` so its width follows the
label; crossfade labels with `AnimatePresence mode="popLayout"`. Delay only
the first appearance; keep a "warm" flag while the pointer is inside.

**Seen in.** Vercel toolbar; Skiper UI skiper43.

## Distance-based spawning (cursor trails)

**Idea.** Drop elements along a pointer path at even spacing.

**Mechanism.** Compare the pointer position with the last drop and spawn
only after `spacing` pixels (`Math.hypot`). Remove each drop after a fixed
lifetime and cap the count. Distance beats time-based spawning: the trail
looks the same at any speed.

**Seen in.** Agency sites; Skiper UI skiper18.

## Animated input text

**Idea.** A number input whose digits animate as you type.

**Mechanism.** Keep a real `<input>` on top with `color: transparent` and a
visible caret; render the value underneath as characters keyed by
`index-char` inside `AnimatePresence`, entering from below with blur.

**Seen in.** Aave swap; Skiper UI skiper22.

## Cover flow

**Idea.** A row where the active item is big and flat and neighbours turn
away in 3D.

**Mechanism.** Absolutely position every item at the center and animate from
its signed, wrapped distance to the active index: `x = offset × size ×
spacing`, `scale` down per step, `rotateY = -offset × ~22°` inside a
`perspective` parent, dim off-center items, hide beyond ±2.

**Seen in.** Apple Cover Flow; Skiper UI skiper47.

## Sticky stacking

**Idea.** Cards stick and pile up while scrolling.

**Mechanism.** `position: sticky; top: base + i × peek` on each card; drive
scale/brightness of buried cards from the container's scroll progress.

**Seen in.** Skiper UI skiper16.

## Clip-path reveal (menus, panels)

**Idea.** A panel unrolls from an edge without layout jumps.

**Mechanism.** Animate `clip-path: inset(0 0 100% 0 round R)` to
`inset(0 0 0% 0 round R)` with an ease-out-expo curve (`[0.22, 1, 0.36, 1]`);
stagger children in after ~150 ms; reverse order on exit.

**Seen in.** Nike; Skiper UI skiper13.

## Border beam (light travelling around a border)

**Idea.** A short comet of light runs around an element's rounded border.
**Mechanism.** Ring = transparent border + `mask: linear-gradient(transparent,transparent) padding-box, linear-gradient(#000,#000) border-box; mask-composite: intersect`. Inside it, a square with `linear-gradient(to left, from, to, transparent)` rides `offset-path: rect(0 auto auto 0 round R)` while `offset-distance` goes 0% → 100% linearly. Alternative: `@property --angle` + `conic-gradient(from var(--angle))` on the border box.
**Numbers.** Magic UI: 50 px beam, 6 s lap, linear, 1 px border. Copia: 60 px, 4 s, 3x on hover eased with ~180 ms time constant; halo = same beam blurred 14 px at 45% behind an opaque face.
**Seen in.** Magic UI Border Beam; Copia `glow-border-button`.
**Pitfalls.** To change speed without a jump, drive `offset-distance` from `useAnimationFrame` instead of changing a Motion `duration` (that restarts the loop). An inset `box-shadow` on an `isolate` parent paints under its negative-z children, so put the resting ring on the face layer.

## Arc dial (curved wheel picker)

**Idea.** A list laid on a circle: drag, flick or scroll and the options slide along the arc, the one in the middle is the value.
**Mechanism.** One float `position` MotionValue (index units). Each option: `angle = clamp((i - position) * spacing / radius, ±1.5)`, `along = r·sin(angle)`, `bend = r·(1 - cos(angle))`; for `side="right"` translate `(-bend, along)` and `rotate(angle)`, origin left center. Opacity falls off past `visibleCount / 2`. Crossing a detent while the gesture is live publishes that value in order (never skip). Drag velocity is smoothed (`v = 0.35·v + 0.65·new`) and on release the target is `nearest(position + v · 0.18 s)`, then a spring settles it. Wheel deltas set `position` directly (trackpads already carry momentum) and a 120 ms idle timer snaps. A concentric inner arc (`radius - inset`, shifted by `inset` along the normal) carries the tick dial.
**Numbers.** Settle spring 360 / 32 / mass 0.6; bracket spread spring 700 / 50 / 0.5; brackets 4 px gap + 6 px spread while active, `scaleY(0.92)`; edges masked `transparent → black 12% … 88% → transparent`. Copia depth: scale `1 - 0.22·depth·t`, blur up to `2.4·depth` px.
**Seen in.** Be UI Arc Picker (Saurabh); Copia `arc-picker`.
**Pitfalls.** Render the options after mount: server-serialized motion transforms differ from the client's first frame and React reports a hydration mismatch. Re-measure label widths after they mount. A drag that ends on an option must swallow its click (`onClickCapture`). Release the wheel at either end so the page can scroll.

## Hover reel (one frame, rolling strip)

**Idea.** A project list where a picture follows the cursor and, between rows, the pictures roll past inside one frame instead of swapping.
**Mechanism.** A single absolutely positioned frame per list, moved by a rAF lerp (`x += (tx − x)·k`) that stops when close, clamped inside the list. Inside, a strip of all pictures stacked vertically, `translate: 0 −100%·active`. Open/close by scaling the frame's inner box from 0. Lean = clamp(dx·0.35, ±tilt) from the per-frame step.
**Numbers.** k 0.16; inset 16 px; scale 0.4 s and roll 0.5 s on `cubic-bezier(0.76, 0, 0.24, 1)`; other rows at 35% opacity.
**Seen in.** Dennis Snellenberg's work list; Olivier Larose's Project Gallery tutorial; Copia `hover-reel`.
**Pitfalls.** Reset the position on pointerleave or the frame slides in from the last exit. Gate the follow to `pointerType === "mouse"`; on touch show inline thumbnails. Put the scale on an inner box so the outer translate (written every frame) never fights a CSS transition.

## Flex-basis accordion (spines)

**Idea.** Panels that widen one at a time without measuring anything.
**Mechanism.** Animate only `flex-basis`: closed `var(--spine)`, open `100%`, everyone `flex-shrink: 1` and floored by `min-width: var(--spine)`. Flex hands the open panel all the remaining space for any count. Inside a `@container`, switch `flex-direction` under a breakpoint and the same rule stacks. Sideways titles via `writing-mode: vertical-rl` + `rotate(180deg)`.
**Numbers.** 700 ms `cubic-bezier(0.22, 1, 0.36, 1)`; spine 4rem; picture inset 0.75rem; cross-fade 700 ms.
**Seen in.** Crafter UI Spine Accordion; Copia `spine-accordion`.
**Pitfalls.** Keep every picture mounted (opacity only) or opening waits on decode. Open on hover only for mouse pointers. Give the container a height.

## Gooey (liquid shapes)

**Idea.** Shapes that fuse when close and stretch apart like liquid.
**Mechanism.** SVG filter on the wrapper: `feGaussianBlur` (stdDeviation 8–14) → `feColorMatrix` alpha row `0 0 0 a b` with a ≈ 20, b ≈ −9 to harden the blurred edge → `feComposite operator="atop"` with the source to keep colours crisp. Same-coloured solid blobs inside; text and icons in a layer above.
**Numbers.** stdDeviation 10 with `20 −9` is a good start; springs with bounce 0.3–0.45.
**Seen in.** Lucas Bebber's Codrops "Creative Gooey Effects" (2015); Copia craft pieces.
**Pitfalls.** Text inside the filter smears; gradients and borders turn to mud; filters repaint every animated frame, so keep the area small; ids must be unique per instance (`useId`).

## Recording tip

The preview recorder uses Chrome's screencast, which only sends frames when
the page repaints. Components that pause while hovered (carousels, marquees)
need a `pauseOnHover={false}` demo, or the preview freezes.

## Template for new entries

```
## <Technique name>

**Idea.** One or two sentences.
**Mechanism.** Layers, properties, formulas.
**Numbers.** Durations, easings, springs, sizes.
**Seen in.** Links.
**Pitfalls.** Performance, browser support, accessibility.
```
