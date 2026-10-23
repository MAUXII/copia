# Segmented Control (craft)

**Interaction.** Pick an option: the selected pill slides under it on a spring and the labels settle.

## States
idle → hover (label to full contrast) → pressed (`scale(0.97)`) → selected (pill arrives, label to foreground). One `layoutId` pill shared across buttons, so it travels instead of fading.

## Numbers
- Pill spring `bounce 0.2, duration 0.45`; reduced motion jumps.
- Label colour 200 ms. Pill shadow `0 1px 2px / 12%` plus a 0.5 px hairline, like iOS.

## Decisions
- Pill at `z-0`, labels at `z-10`: in flight it passes under the neighbours' labels (without it, it painted over them).
- Roving `tabIndex`, arrow keys on both axes, `radiogroup`. `haptics`: 3 ms vibration on change.
- Credits Apple's HIG for the pattern; no code copied.
