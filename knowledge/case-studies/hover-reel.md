# Hover Reel

## Sources
- Original: the work list on [Dennis Snellenberg's portfolio](https://dennissnellenberg.com/work).
- Studied: Olivier Larose's [Project Gallery tutorial](https://blog.olivierlarose.com/tutorials/project-gallery-mouse-hover) (Next.js, GSAP, Framer Motion), which credits Dennis.
- Studied: a "Hover Reel" version handed to us as code (React, a CSS file and canvas-painted studies): pointer lerp 0.16, frame clamped inside the list, focus parks the frame beside the row, touch shows inline thumbnails.
- Also seen: SmoothUI's [Hover Image List](https://21st.dev/@educalvolpz/components/hover-image-list) (spring follow with skew), Savva Sicevs' [Project Index](https://21st.dev/@ssychui/components/project-index).

## Mechanism
- One frame for the whole list, absolutely positioned in the list. It
  follows the pointer with a lerp (`x += (target − x) · 0.16` per frame),
  centred on the cursor and clamped 16 px inside the list; the loop stops
  once it is within 0.3 px.
- Inside the frame, a vertical strip holds every picture; the active row
  translates it to `−100% × index`, so moving between rows rolls the
  pictures past instead of swapping them.
- Open and close: `scale` 0 → 1 in 0.4 s on Dennis's curve
  `cubic-bezier(0.76, 0, 0.24, 1)`; the strip rolls in 0.5 s on the same
  curve.
- Leaving the list closes it and forgets the position, so the next entry
  places the frame under the pointer without a slide.
- Keyboard: focusing a row (`:focus-visible`) parks the frame at the row's
  right edge.

## What Copia changed or added
- One file, Tailwind and theme tokens instead of a CSS file and
  paper/night themes; real photos (Lummi) instead of painted studies.
- The frame leans into fast horizontal moves (`tilt`, up to 6° by default),
  after the skew in SmoothUI's version.
- A round "View" badge rides the frame (`cursorLabel`), after Dennis's
  cursor; it scales in 60 ms after the frame.
- Rows dim to 35% while another is active, and the active title and label
  slide apart by 10 px, as on Dennis's site.
- Touch screens (`pointer: coarse`) hide the frame and show a small picture
  inline in each row.

## Known differences from the original
- Dennis's cursor is a separate element that trails the frame with its own
  lag; here the badge rides the frame.
