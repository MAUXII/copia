import { chromium } from "playwright"

/**
 * Opens a Chromium window with the Chrome DevTools Protocol enabled so REA can
 * attach to it. Usage: npm run rea:browser <url> [port]
 * Then: rea list-browser-targets http://127.0.0.1:<port>
 */
const url = process.argv[2]
const port = Number(process.argv[3] ?? 9333)
if (!url) {
  console.error("Usage: npm run rea:browser <url> [port]")
  process.exit(1)
}

async function main() {
  const browser = await chromium.launch({ headless: process.env.HEADLESS === "1", args: [`--remote-debugging-port=${port}`] })
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await page.goto(url, { waitUntil: "networkidle" })
  console.log(`✓ CDP endpoint: http://127.0.0.1:${port}`)
  console.log(`  Next: rea list-browser-targets http://127.0.0.1:${port}`)
  console.log("  Press Ctrl+C to close the browser.")
  process.on("SIGINT", () => browser.close().then(() => process.exit(0)))
  await new Promise(() => {})
}

main()
