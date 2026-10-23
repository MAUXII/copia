# Arc Picker

## Sources
- Primary: [Be UI Arc Picker](https://beui.dev/components/motion/arc-picker) by Saurabh ([@starc007](https://github.com/starc007)), MIT, found on [21st.dev](https://21st.dev/@starc007/components/arc-picker).
- Registry source studied: `https://beui.dev/r/arc-picker.json`.

## Mechanism
- Every option shares one float `position` MotionValue in index units. Its
  transform comes from the angle `(i - position) * spacing / radius`
  (clamped to ±1.5 rad): `along = r·sin`, `bend = r·(1 − cos)`, then
  rotate by the angle. The side decides which axis bends.
- Opacity fades from `visibleCount / 2` outward; options off the arc stop
  taking pointer events.
- Drag: 6 px threshold, pointer capture, smoothed velocity
  (`0.35·v + 0.65·new`, options per second). Release projects
  `velocity × 0.18 s` and snaps to the nearest enabled option with a
  360 / 32 / 0.6 spring.
- Wheel: follows `deltaY` directly (trackpads carry their own momentum),
  snaps after 120 ms without events, and lets the page scroll at either end.
- Every detent crossed during a gesture is published in order, so
  `onValueChange` sees each option.
- `[` `]` brackets: positioned at the label anchor, spring to the selected
  label's measured width; while a gesture is active they spread 6 px and
  squash to `scaleY(0.92)` (700 / 50 / 0.5 spring).
- Edges fade with a `linear-gradient` mask (12% / 88%).
- Accessibility: `radiogroup` of `radio` buttons, roving `tabIndex`, arrows
  (Shift for 5), Page Up/Down, Home/End, a hidden instruction, an optional
  hidden input for forms.

## What Copia changed or added
- **Tick dial:** a long tick per option and a short one between, on a
  concentric inner arc; the selected tick takes the accent.
- **Depth:** options shrink (up to 22%) and blur (up to 2.4 px) as they curve
  away, scaled by a `depth` prop (0 turns it off; reduced motion turns it off).
- **Haptic detents:** `navigator.vibrate(4)` on each detent crossed by a
  gesture, behind `haptics`.
- **Accent colour prop** (with a colour picker in the viewer), defaulting
  to the reference's blue instead of following the theme's primary.
- Rewritten in about half the code, with no extra dependencies
  (`clsx`, `tailwind-merge` and the shared ease file are gone).
- Options render after mount, which removes a hydration mismatch the
  original shows under server rendering.

## Known differences from the original
- When a controlled parent rejects a value mid-gesture, the original rolls
  the dial back after two frames; Copia keeps gliding and follows the parent
  on its next render.
- Bracket width does not jump instantly on keyboard moves; it springs.
