---
name: find-component
description: Find the best existing versions of a UI component or effect across the web (product sites, Shoogle, Skiper UI, 21st.dev, Aceternity, Magic UI, Motion Primitives, React Bits, Codrops) and return a ranked shortlist with links and how each works. Use when someone asks "where can I find X", "what's the best X", or wants options before copying. Does not build anything; hand off to copy-component to build.
metadata:
  version: "1"
---

# Find a component

1. Restate what is wanted in one line (the effect and the context it will
   live in).
2. Search following
   [sources](../copy-component/references/sources.md): Shoogle first, then the
   libraries, then originals and the open web.
3. Open each promising result. Note what it does, how (if visible), its
   quality, and its license or terms when the user will reuse code.
4. Return 3–5 options, best first:

```
1. <Name> — <site> — <link>
   How: <mechanism in one line>
   Why pick it: <strength>   Watch out: <weakness>
```

5. Recommend one as the primary reference and say which features from the
   others are worth adding. Offer to run `copy-component` on it.
