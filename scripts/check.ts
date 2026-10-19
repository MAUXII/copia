import { readdirSync, existsSync } from "node:fs"
import { checkAll } from "../lib/check"

const problems = checkAll()
if (problems.length > 0) {
  for (const p of problems) console.error(`✗ ${p.file} — ${p.rule}. Fix: ${p.fix}`)
  console.error(`\n${problems.length} problem(s) found.`)
  process.exit(1)
}
const count = existsSync("registry") ? readdirSync("registry", { withFileTypes: true }).filter((e) => e.isDirectory()).length : 0
console.log(`✓ ${count} components OK`)
