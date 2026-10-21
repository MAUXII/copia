import { cn } from "@/lib/utils"

/** "Slices" mark: a half disc with two copies peeling off to the right. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 68 56" aria-hidden className={cn("h-[22px] w-[27px] shrink-0", className)}>
      <defs>
        <linearGradient id="copia-mark-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFC48A" />
          <stop offset="1" stopColor="#FF4D1C" />
        </linearGradient>
        {/* Each slice is a shifted disc minus the previous piece's outline plus a gap. */}
        <mask id="copia-mark-slice-1">
          <rect width="68" height="56" fill="#fff" />
          <circle cx="4" cy="28" r="29.2" fill="#000" />
        </mask>
        <mask id="copia-mark-slice-2">
          <rect width="68" height="56" fill="#fff" />
          <circle cx="21" cy="28" r="29.2" fill="#000" />
        </mask>
      </defs>
      <g fill="url(#copia-mark-gradient)">
        <path d="M4 2 A26 26 0 0 1 4 54 Z" />
        <circle cx="21" cy="28" r="26" mask="url(#copia-mark-slice-1)" />
        <circle cx="38" cy="28" r="26" mask="url(#copia-mark-slice-2)" />
      </g>
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-[15px] font-medium tracking-tight", className)}>
      <LogoMark />
      copia
    </span>
  )
}
