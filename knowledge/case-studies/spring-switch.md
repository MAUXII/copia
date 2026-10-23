# Spring Switch (craft)

**Interaction.** Flip it: the thumb springs across; hold it and the thumb stretches toward its destination, like iOS.

## States
off → pressed (thumb 27 → 34 px wide) → on (thumb springs over, track takes `onColor`) and back.

## Numbers
- 51 × 31 track, 27 px thumb, 2 px inset (iOS proportions).
- Thumb spring `stiffness 520, damping 34, mass 0.7` on `layout` and width; track colour 300 ms.

## Decisions
- Thumb placed by `justify-start/end` and moved with `layout`, so one spring handles slide and stretch.
- Space shows the stretch too. `role="switch"`, visible `label` or `aria-label`.
