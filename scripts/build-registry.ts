import { execSync } from "node:child_process"
import { rmSync, writeFileSync } from "node:fs"
import { buildDemosModule, buildRegistryJson } from "../lib/tooling/build-registry"

const json = buildRegistryJson()
writeFileSync("registry.json", JSON.stringify(json, null, 2) + "\n")
writeFileSync("lib/demos.ts", buildDemosModule())
console.log(`✓ registry.json + lib/demos.ts (${json.items.length} components)`)
// Start clean, so removed components do not stay installable.
rmSync("public/r", { recursive: true, force: true })
execSync("npx shadcn build --output public/r", { stdio: "inherit" })
