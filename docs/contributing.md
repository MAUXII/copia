# Adding a component

The full workflow lives in the
[`copy-component` skill](../.agents/skills/copy-component/SKILL.md); this is
the short version for humans.

1. **Find it.** Search Shoogle, Skiper UI, 21st.dev and the original site
   ([sources](../.agents/skills/copy-component/references/sources.md)).
2. **Understand it.** Inspect it with REA or DevTools and write down the
   mechanism and numbers ([REA for UI](using-rea.md)).
3. **Scaffold.** `npm run new <slug>`.
4. **Build.** One file, allowed imports only (`react`, `motion`,
   `lucide-react`, `@/lib/utils`, `three`/`gsap` for WebGL), theme variables, every colour as a prop
   with a `color` control (default: the reference's colour), keyboard support,
   reduced motion. Add at least one feature beyond the reference.
5. **Demo.** `demo.tsx` should show the effect within ~5 seconds of cursor
   movement (see [previews](previews.md)).
6. **Preview.** `npm run preview <slug>`.
7. **Check.** `npm run check` must pass.
8. **Credit.** Fill `inspiration` in `meta.json`
   ([policy](credits-and-removal.md)) and write
   `knowledge/case-studies/<slug>.md`.
9. **Pull request.** Use the template; optionally tell us on the site.

## meta.json

See the [Copia contract](../.agents/skills/copy-component/references/copia-contract.md)
for every field and the case study template.
