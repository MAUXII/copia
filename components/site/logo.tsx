import { cn } from "@/lib/utils"

/** "Twin" mark: the original sphere and its translucent copy. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("relative inline-block size-[22px] shrink-0", className)}>
      <span className="logo-sphere bottom-0 left-0" />
      <span className="logo-sphere top-0 right-0 opacity-55 mix-blend-screen" />
    </span>
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
