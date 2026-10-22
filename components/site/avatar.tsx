import { cn } from "@/lib/utils"

/** Author picture; falls back to initials on the brand gradient when there is none. */
export function Avatar({ src, name, className }: { src: string | null; name: string; className?: string }) {
  if (src) {
    // A remote GitHub avatar: next/image would need a remote pattern and adds nothing at this size.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={cn("shrink-0 rounded-2xl bg-muted object-cover", className)} />
  }
  const initials = name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
  return (
    <span aria-hidden className={cn("grid shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#FFC48A] to-[#FF4D1C] font-medium text-[#1a0a04]", className)}>
      {initials}
    </span>
  )
}
