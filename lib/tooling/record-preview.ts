import { execFileSync } from "node:child_process"
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { chromium, type Page } from "playwright"
import { PREVIEW_THEMES, type PreviewTheme } from "../previews"

export { PREVIEW_THEMES }

const WIDTH = 1280 // output size
const HEIGHT = 800
// Render a small viewport at high pixel density: components appear 2.5x larger
// in the output while pointer coordinates stay native (CSS zoom breaks them).
const SCALE = 2.5
const VIEW_W = WIDTH / SCALE
const VIEW_H = HEIGHT / SCALE
const FPS = 30
const LEAD_IN = 0.8 // seconds captured before the clip starts, so the cursor is already moving

type Options = { baseUrl: string; outDir: string; seconds?: number; theme?: PreviewTheme }
type Frame = { data: string; timestamp: number }

/** Moves the cursor in from the left, over the center and around it, so hover effects show. */
async function performCursorPath(page: Page, seconds: number) {
  const cx = VIEW_W / 2
  const cy = VIEW_H / 2
  const steps = Math.round(seconds * FPS)
  const start = VIEW_W * 0.06
  await page.mouse.move(start, cy)
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const angle = t * Math.PI * 2
    const approach = Math.min(1, t * 4) // first quarter: glide in toward the center
    const x = start + (cx + Math.cos(angle + Math.PI) * VIEW_W * 0.17 * (1 - approach * 0.4) - start) * approach
    const y = cy + Math.sin(angle) * VIEW_H * 0.17 * approach
    await page.mouse.move(x, y)
    await page.waitForTimeout(1000 / FPS)
  }
}

/** Writes captured frames as JPEGs plus an ffconcat list that keeps their real timing. */
function writeFrames(frames: Frame[], dir: string, endTimestamp: number) {
  const lines = ["ffconcat version 1.0"]
  frames.forEach((frame, i) => {
    const file = `f${String(i).padStart(5, "0")}.jpg`
    writeFileSync(path.join(dir, file), Buffer.from(frame.data, "base64"))
    // The screencast only sends a frame when something repaints, so the last
    // frame lasts until the recording stopped.
    const next = frames[i + 1]?.timestamp ?? Math.max(endTimestamp, frame.timestamp + 1 / FPS)
    lines.push(`file ${file}`, `duration ${(next - frame.timestamp).toFixed(4)}`)
  })
  // The concat demuxer ignores the last duration unless the file is repeated.
  lines.push(`file f${String(frames.length - 1).padStart(5, "0")}.jpg`)
  const list = path.join(dir, "frames.txt")
  writeFileSync(list, lines.join("\n"))
  return list
}

export async function recordPreview(slug: string, { baseUrl, outDir, seconds = 5, theme = "dark" }: Options) {
  const work = mkdtempSync(path.join(tmpdir(), "copia-frames-"))
  const frames: Frame[] = []
  let endTimestamp = 0
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({ viewport: { width: VIEW_W, height: VIEW_H }, deviceScaleFactor: SCALE, colorScheme: theme })
    await page.goto(`${baseUrl}/preview/${slug}?theme=${theme}`, { waitUntil: "networkidle" })
    await page.waitForTimeout(500)

    // Chrome's screencast delivers frames at device resolution (1280x800), unlike recordVideo.
    const cdp = await page.context().newCDPSession(page)
    cdp.on("Page.screencastFrame", async (event) => {
      frames.push({ data: event.data, timestamp: event.metadata.timestamp ?? Date.now() / 1000 })
      await cdp.send("Page.screencastFrameAck", { sessionId: event.sessionId }).catch(() => {})
    })
    await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: WIDTH, maxHeight: HEIGHT, everyNthFrame: 1 })
    const startTimestamp = Date.now() / 1000
    await performCursorPath(page, seconds + LEAD_IN + 0.3)
    endTimestamp = Date.now() / 1000
    await cdp.send("Page.stopScreencast")
    // A page that never repaints still needs a first frame.
    if (frames.length === 0) {
      const shot = await page.screenshot({ type: "jpeg", quality: 92 })
      frames.push({ data: shot.toString("base64"), timestamp: startTimestamp })
    }
  } catch (error) {
    rmSync(work, { recursive: true, force: true })
    throw error
  } finally {
    await browser.close()
  }
  const name = `${slug}${PREVIEW_THEMES.find((t) => t.theme === theme)!.suffix}`
  const mp4 = path.join(outDir, `${name}.mp4`)
  const webp = path.join(outDir, `${name}.webp`)
  try {
    const list = writeFrames(frames, work, endTimestamp)
    mkdirSync(outDir, { recursive: true })
    const ff = (args: string[]) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args])
    ff([
      "-f", "concat", "-safe", "0", "-i", list,
      "-ss", String(LEAD_IN), "-t", String(seconds),
      "-vf", `fps=${FPS},scale=${WIDTH}:${HEIGHT}:flags=lanczos,format=yuv420p`,
      "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-movflags", "+faststart", mp4,
    ])
    ff(["-ss", String(seconds / 2), "-i", mp4, "-frames:v", "1", "-quality", "82", webp])
  } finally {
    // Never leave the frame folder behind, even when ffmpeg fails.
    rmSync(work, { recursive: true, force: true })
  }
  return { webp, mp4 }
}
