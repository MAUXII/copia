# Previews

Every component ships a poster and a short loop in each theme, shown on the
grid (the card shows the take that matches the reader's theme):

- `public/previews/<slug>.webp` and `<slug>.mp4` — dark theme
- `public/previews/<slug>-light.webp` and `<slug>-light.mp4` — light theme
- posters 1280×800; loops 3–8 s, 1280×800, no audio

Generate all four with:

```bash
npm run preview <slug>
```

The recorder opens `/preview/<slug>` and then `/preview/<slug>?theme=light`
(your `demo.tsx` alone, centered) in Chromium at 2.5× pixel density, moves the cursor in from the left
and circles the center for about five seconds, and encodes the result with
ffmpeg (required on your PATH).

## Make the demo record well

- Show the effect without clicks: hover, an auto-cycling state, or a slow
  auto-scroll that stops when the user interacts.
- Fill the whole area: the demo root is `flex-1`; no boxes, borders or
  inner scroll windows. Scrolling effects make the page itself taller.
- Do not pause animations on hover in the demo (the cursor stays over it).
- Check the poster after recording; if the effect is not visible, fix the
  demo, not the recorder.

## WebGL and canvas demos

The recorder launches Chromium on the real GPU (`--use-angle=d3d11` on
Windows, `metal` on macOS). Without it, headless Chromium renders WebGL in
software and shader-heavy demos record at about 5 fps. Long intros eat the
clip: if a demo has one, let the customizer turn it on but keep it off by
default, so the preview shows the effect itself.
