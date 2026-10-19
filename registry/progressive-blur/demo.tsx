import { ProgressiveBlur } from "./progressive-blur"

const paragraph =
  "Most components here are recreations of the best interfaces on the web. We study how they work, rebuild them as a single file, add a feature or two and credit the people who made them first. Scroll and the words drift under the edges of the page, melting into blur the way iOS does it: layer over layer, a little softer each time, until the text is only a shape and then nothing at all."

export default function Demo() {
  return (
    <div className="relative h-[300px] w-[440px] max-w-full overflow-hidden rounded-2xl bg-[#f5f4f3] text-black [clip-path:inset(0_round_1rem)]">
      <style>{"@keyframes copia-pb-demo{from{transform:translateY(0)}to{transform:translateY(-50%)}}.copia-pb-scroll{animation:copia-pb-demo 14s linear infinite}@media (prefers-reduced-motion:reduce){.copia-pb-scroll{animation:none}}"}</style>
      <div className="copia-pb-scroll px-10">
        {[0, 1].map((copy) => (
          <div key={copy} aria-hidden={copy === 1} className="flex flex-col items-center gap-10 pt-16 pb-6">
            <div className="flex flex-col items-center gap-3">
              <span className="text-center text-[9px] leading-tight tracking-wide text-black/50 uppercase">
                Scroll down
                <br />
                to see the effect
              </span>
              <span className="h-12 w-px bg-black/40" />
            </div>
            {[0, 1, 2].map((p) => (
              <p key={p} className="text-justify text-[13px] leading-relaxed text-black/40">
                {paragraph}
              </p>
            ))}
          </div>
        ))}
      </div>
      <ProgressiveBlur direction="top" className="h-24" />
      <ProgressiveBlur direction="bottom" className="h-24" />
    </div>
  )
}
