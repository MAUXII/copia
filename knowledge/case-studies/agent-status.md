# Agent Status (agents)

**Interaction.** While an agent works, one line says what it is doing; when it finishes, the line settles into "Done in 4.2s". Click to see the steps.

## States
running step n (spinner, shimmering label) → step n+1 (label slides up and out with a blur, the next slides in) → done (spinner shrinks away, check springs in, label stops shimmering) · collapsed ↔ expanded (height animates to auto).

## Numbers
- Swaps: spring `bounce 0.2, duration 0.45`; label `y ±8px` with `blur(4px)`.
- Shimmer: a light band in the foreground colour over muted text, `background-size 250%`, 1.6 s linear loop, off with reduced motion.
- Check: `scale 0.4 → 1` on the same spring.

## Decisions
- Colours from theme tokens; the check colour is a prop.
- `AnimatePresence mode="popLayout"` so the outgoing label leaves the flow at once and the line never grows.
- A live region announces each step and "Done".
