# Number Ticker (craft)

**Interaction.** When the value changes, each digit rolls to its new figure like an odometer, right-hand columns first.

## Numbers
- Each column is a 0–9 strip in a one-line window, moved to `−digit × 10%`.
- Spring `bounce 0.15, duration 0.7`; columns 40 ms apart from the right (`stagger`).

## Decisions
- `Intl.NumberFormat` builds the string; only digits roll, separators and signs stay put.
- Columns keyed from the right, so a new leading digit slides in without reshuffling.
- An invisible "0" fixes column width (with `tabular-nums`): no sideways jitter.
- Full value is the accessible name.
