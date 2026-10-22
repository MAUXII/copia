import { cn } from "@/lib/utils"

// Fine film grain, tiled over the generated avatars.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 1.2 0'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E\")"

// Hues that stay calm as a lit sphere: blues, violets, roses, ambers, teals (no neon greens).
const HUES = [218, 232, 252, 272, 296, 336, 352, 14, 30, 196, 172]

/** Same handle, same colour: a stable pick from the palette. */
function hue(seed: string) {
  let h = 0
  for (const char of seed) h = (Math.imul(h, 31) + char.charCodeAt(0)) | 0
  return HUES[Math.abs(h) % HUES.length]
}

/**
 * Author picture: the real one when there is one, otherwise a lit sphere in a
 * colour of its own with a film grain. Claimed pages wear a verified seal.
 */
export function Avatar({ src, name, seed, verified = false, className }: { src: string | null; name: string; seed: string; verified?: boolean; className?: string }) {
  const h = hue(seed)
  return (
    <span className={cn("relative inline-block shrink-0", className)}>
      {src ? (
        // A remote GitHub avatar: next/image would need a remote pattern and adds nothing at this size.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full rounded-full bg-muted object-cover" />
      ) : (
        <span
          role="img"
          aria-label={name}
          className="block size-full overflow-hidden rounded-full"
          style={{ background: `radial-gradient(circle at 34% 28%, hsl(${h} 88% 78%), hsl(${h} 70% 61%) 44%, hsl(${(h + 18) % 360} 58% 42%) 100%)` }}
        >
          <span aria-hidden className="block size-full opacity-40 mix-blend-overlay" style={{ backgroundImage: GRAIN, backgroundSize: "120px" }} />
        </span>
      )}
      {verified && (
        <span title="Verified: claimed by its owner" className="absolute -right-[3%] -bottom-[3%] grid size-[38%] place-items-center rounded-full bg-background">
          {/* One border only (the ring in the page colour): the seal itself is filled, not outlined. */}
          <svg viewBox="0 0 24 24" role="img" aria-label="Verified" className="size-[84%]">
            <path
              fill="#ff5a24"
              d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
            />
            <path d="m8.6 12.2 2.3 2.3 4.5-4.6" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </span>
  )
}
