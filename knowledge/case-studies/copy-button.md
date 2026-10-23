# Copy Button (craft)

**Interaction.** Click copy: the icon morphs into a check, the label swaps to "Copied", the button resizes to fit, then everything morphs back.

## States
idle → pressed (`scale(0.97)`) → copied (check in `successColor`) → idle after `timeout`.

## Numbers
- Width: `layout` spring `bounce 0.25, duration 0.4`.
- Swaps: opacity, `scale 0.6 → 1`, `blur(4px) → 0`, `AnimatePresence mode="popLayout"`.
- Copied state 1600 ms.

## Decisions
- Label uses `layout="position"` so it slides with the resize instead of stretching.
- `copied` prop shows the state without copying (demos, controlled use). Live region announces "Copied".
