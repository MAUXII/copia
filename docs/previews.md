# Previews

Every component ships a poster and a short loop, shown on the grid:

- `public/previews/<slug>.webp` — poster, 1280×800
- `public/previews/<slug>.mp4` — 3–8 s loop, 1280×800, no audio

Generate both with:

```bash
npm run preview <slug>
```

The recorder opens `/preview/<slug>` (your `demo.tsx` alone, centered, dark
theme) in Chromium at 2.5× pixel density, moves the cursor in from the left
and circles the center for about five seconds, and encodes the result with
ffmpeg (required on your PATH).

## Make the demo record well

- Show the effect without clicks: hover, an auto-cycling state, or a slow
  auto-scroll that stops when the user interacts.
- Fit the demo in roughly 440×300 CSS pixels.
- Do not pause animations on hover in the demo (the cursor stays over it).
- Check the poster after recording; if the effect is not visible, fix the
  demo, not the recorder.
