# Crediting

Copia exists because other people made great things first. Credit is not
optional.

0. **Copy the reference's own attribution.** If the version you studied says
   "Inspired by X" (Skiper UI shows it under **Show Info → Attribution**), X
   is the original: put X in `inspiration`, not the site you studied. Extra
   names it credits ("built while learning from …", "micro-interactions from
   …") go in `meta.json` → `credits`. Only when the reference credits no one
   does the reference itself become the `inspiration`.
1. **Original creator** goes in `meta.json` → `inspiration` (`author`, `url`).
   This is who invented the interaction: Apple for the Dynamic Island, Vercel
   for its tooltip, a designer for an Awwwards effect.
2. **Versions you studied** go in the case study's Sources section, with links
   (for example Skiper UI, Motion Primitives, Aceternity).
3. The component page shows "Inspired by <original>" and links the case study
   through "View source on GitHub".
4. If an author asks for a credit fix or removal, handle it through the
   `removal-request` issue template within a week.

When the original is unknown, credit the earliest version you can find and
say so in the case study ("earliest version found").
