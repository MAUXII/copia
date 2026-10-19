import { createComponent } from "../lib/tooling/new-component"

const [slug, category] = process.argv.slice(2)
if (!slug) {
  console.error("Usage: npm run new <slug> [category]   (example: npm run new glow-button buttons)")
  process.exit(1)
}
try {
  createComponent(slug, undefined, { category })
  console.log(`✓ Created registry/${slug}/ (${slug}.tsx, demo.tsx, meta.json)`)
  console.log(`Next: write the component and demo, fill meta.json, then run: npm run preview ${slug} && npm run check`)
} catch (error) {
  console.error(`✗ ${(error as Error).message}`)
  process.exit(1)
}
