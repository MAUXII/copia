import { cn } from "@/lib/utils"

// Apple's emoji artwork, served by the emoji-datasource-apple package (not bundled in this repo).
const SOURCE = "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.1.2/img/apple/64"

/** "👍" → "1f44d"; variation selectors are dropped, joiners kept, as the image names expect. */
function codepoints(char: string) {
  return [...char]
    .map((c) => c.codePointAt(0)!)
    .filter((cp) => cp !== 0xfe0f)
    .map((cp) => cp.toString(16))
    .join("-")
}

/** An emoji drawn the same on every platform, in Apple's style. Sized to the text by default. */
export function Emoji({ char, label, className }: { char: string; label?: string; className?: string }) {
  return (
    // A tiny remote image: next/image would need a remote pattern and adds nothing here.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${SOURCE}/${codepoints(char)}.png`}
      alt={label ?? char}
      draggable={false}
      className={cn("inline-block size-[1.15em] align-[-0.2em] select-none", className)}
    />
  )
}
