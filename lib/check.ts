import { execFileSync } from "node:child_process"
import { existsSync, readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { MetaSchema, SLUG_RE } from "./schema"

export type Problem = { file: string; rule: string; fix: string }

export const ALLOWED_IMPORTS = ["react", "motion", "motion/react", "lucide-react", "@/lib/utils"]
const PREVIEW_SIZE = { width: 1280, height: 800 }
const PREVIEW_SECONDS = { min: 3, max: 8 }

// import … from "x" | export … from "x" | import("x") | import(`x`) | import "x" | require("x")
const IMPORT_RE =
  /(?:import|export)\s[^"'`]*?from\s*["']([^"']+)["']|(?:import|require)\s*\(\s*["'`]([^"'`]+)["'`]\s*\)|import\s*["']([^"']+)["']/g

/** Files the OS or editors drop into folders; never part of a component. */
const IGNORED_FILES = new Set([".DS_Store", "Thumbs.db", "desktop.ini"])

function importsOf(source: string): string[] {
  return [...source.matchAll(IMPORT_RE)].map((m) => m[1] ?? m[2] ?? m[3])
}

let ffprobeMissing: boolean | null = null
function hasFfprobe() {
  if (ffprobeMissing === null) {
    try {
      execFileSync("ffprobe", ["-version"], { stdio: "ignore" })
      ffprobeMissing = false
    } catch {
      ffprobeMissing = true
    }
  }
  return !ffprobeMissing
}

/** npm package name of an import specifier ("motion/react" -> "motion"). */
function packageOf(spec: string) {
  return spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0]
}

type Probe = { width: number; height: number; duration: number; hasAudio: boolean }

function probe(file: string): Probe | null {
  try {
    const out = execFileSync("ffprobe", ["-v", "error", "-show_entries", "stream=codec_type,width,height:format=duration", "-of", "json", file], { encoding: "utf8" })
    const data = JSON.parse(out)
    const video = data.streams.find((s: { codec_type: string }) => s.codec_type === "video")
    return {
      width: video?.width ?? 0,
      height: video?.height ?? 0,
      duration: Number(data.format?.duration ?? 0),
      hasAudio: data.streams.some((s: { codec_type: string }) => s.codec_type === "audio"),
    }
  } catch {
    return null
  }
}

function checkPreviews(slug: string, previewsDir: string): Problem[] {
  const problems: Problem[] = []
  const regen = `Run: npm run preview ${slug}`
  for (const ext of ["webp", "mp4"] as const) {
    const file = path.join(previewsDir, `${slug}.${ext}`)
    const shown = `public/previews/${slug}.${ext}`
    if (!existsSync(file)) {
      problems.push({ file: shown, rule: `${slug}.${ext} is missing`, fix: regen })
      continue
    }
    if (!hasFfprobe()) {
      problems.push({ file: shown, rule: "ffprobe was not found, so previews cannot be verified", fix: "Install ffmpeg (it includes ffprobe) and make sure it is on your PATH." })
      continue
    }
    const info = probe(file)
    if (!info) {
      problems.push({ file: shown, rule: "file could not be read as media", fix: regen })
      continue
    }
    if (info.width !== PREVIEW_SIZE.width || info.height !== PREVIEW_SIZE.height) {
      problems.push({ file: shown, rule: `must be 1280x800, got ${info.width}x${info.height}`, fix: regen })
    }
    if (ext === "mp4") {
      if (info.duration < PREVIEW_SECONDS.min || info.duration > PREVIEW_SECONDS.max) {
        problems.push({ file: shown, rule: `must last 3–8 s, got ${info.duration.toFixed(1)} s`, fix: regen })
      }
      if (info.hasAudio) problems.push({ file: shown, rule: "must not have an audio track", fix: regen })
    }
  }
  return problems
}

export function checkComponent(dir: string, previewsDir: string): Problem[] {
  const folder = path.basename(dir)
  const problems: Problem[] = []
  const at = (file: string) => `registry/${folder}/${file}`

  if (!SLUG_RE.test(folder)) {
    problems.push({ file: at(""), rule: `folder "${folder}" must be kebab-case (a-z, 0-9, hyphens)`, fix: "Rename the folder, e.g. magnetic-button." })
  }

  const expected = [`${folder}.tsx`, "demo.tsx", "meta.json"]
  const files = readdirSync(dir).filter((f) => !IGNORED_FILES.has(f))
  if (files.length !== expected.length || !expected.every((f) => files.includes(f))) {
    problems.push({
      file: at(""),
      rule: `only ${folder}.tsx, demo.tsx, meta.json allowed (found: ${files.join(", ")})`,
      fix: "Keep the whole component in one file; move helpers into it and delete extra files.",
    })
  }

  let dependencies: string[] = []
  const metaFile = path.join(dir, "meta.json")
  if (existsSync(metaFile)) {
    let raw: unknown
    try {
      raw = JSON.parse(readFileSync(metaFile, "utf8"))
    } catch {
      problems.push({ file: at("meta.json"), rule: "meta.json is not valid JSON", fix: "Fix the JSON syntax." })
    }
    if (raw !== undefined) {
      const result = MetaSchema.safeParse(raw)
      if (!result.success) {
        for (const issue of result.error.issues) {
          problems.push({
            file: at("meta.json"),
            rule: `${issue.path.join(".") || "meta"}: ${issue.message}`,
            fix: "See docs/contributing.md for the meta.json format (inspiration is required).",
          })
        }
      } else {
        dependencies = result.data.dependencies
        if (result.data.slug !== folder) {
          problems.push({ file: at("meta.json"), rule: `folder name must match meta.slug ("${folder}" vs "${result.data.slug}")`, fix: "Rename the folder or fix meta.slug." })
        }
      }
    }
  }

  const used = new Set<string>()
  for (const file of [`${folder}.tsx`, "demo.tsx"]) {
    const full = path.join(dir, file)
    if (!existsSync(full)) continue
    for (const spec of importsOf(readFileSync(full, "utf8"))) {
      const ownRelative = file === "demo.tsx" && spec === `./${folder}`
      if (ownRelative) continue
      if (!ALLOWED_IMPORTS.includes(spec)) {
        problems.push({ file: at(file), rule: `import "${spec}" is not allowed`, fix: `Allowed imports: ${ALLOWED_IMPORTS.join(", ")}${file === "demo.tsx" ? `, ./${folder}` : ""}.` })
        continue
      }
      if (!spec.startsWith("@/") && packageOf(spec) !== "react") used.add(packageOf(spec))
    }
  }
  for (const pkg of used) {
    if (!dependencies.includes(pkg)) {
      problems.push({ file: at("meta.json"), rule: `"${pkg}" must be listed in meta.dependencies`, fix: `Add "${pkg}" to the dependencies array.` })
    }
  }

  problems.push(...checkPreviews(folder, previewsDir))
  return problems
}

export function checkAll(root = "registry", previewsDir = "public/previews"): Problem[] {
  if (!existsSync(root)) return []
  const dirs = readdirSync(root, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => path.join(root, e.name))
  const problems = dirs.flatMap((dir) => checkComponent(dir, previewsDir))

  const seen = new Map<string, string>()
  for (const dir of dirs) {
    try {
      const slug = JSON.parse(readFileSync(path.join(dir, "meta.json"), "utf8")).slug
      if (seen.has(slug)) {
        problems.push({ file: `registry/${path.basename(dir)}/meta.json`, rule: `duplicate slug "${slug}" (also in registry/${seen.get(slug)})`, fix: "Each component needs a unique slug." })
      } else seen.set(slug, path.basename(dir))
    } catch {
      // invalid meta already reported by checkComponent
    }
  }
  return problems
}
