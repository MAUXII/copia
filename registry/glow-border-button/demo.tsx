import { ArrowRight } from "lucide-react"
import { GlowBorderButton } from "./glow-border-button"

export default function Demo() {
  return (
    <div className="grid flex-1 place-items-center p-6">
      <GlowBorderButton size={70} glow={12} className="scale-[1.8] px-8 py-4 text-base">
        Get started <ArrowRight className="size-4" />
      </GlowBorderButton>
    </div>
  )
}
