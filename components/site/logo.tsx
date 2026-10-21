import { cn } from "@/lib/utils"

/** "Slices" mark: a half disc with two copies peeling off to the right. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={cn("size-[22px] shrink-0", className)}>
      <defs>
        <linearGradient id="copia-mark-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFC48A" />
          <stop offset="1" stopColor="#FF4D1C" />
        </linearGradient>
        {/* Each slice is a shifted disc minus the previous piece's outline plus a gap. */}
        <mask id="copia-mark-slice-1">
          <rect width="64" height="64" fill="#fff" />
          <circle cx="6" cy="32" r="27.5" fill="#000" />
        </mask>
        <mask id="copia-mark-slice-2">
          <rect width="64" height="64" fill="#fff" />
          <circle cx="18" cy="32" r="27.5" fill="#000" />
        </mask>
      </defs>
      <g fill="url(#copia-mark-gradient)">
        <path d="M6 8 A24 24 0 0 1 6 56 Z" />
        <circle cx="18" cy="32" r="24" mask="url(#copia-mark-slice-1)" />
        <circle cx="30" cy="32" r="24" mask="url(#copia-mark-slice-2)" />
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
