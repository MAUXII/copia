import { CardStackScroll, type CardStackScrollProps } from "./card-stack-scroll"

/** Free photos from Lummi (lummi.ai); authors in meta.json → assets. */
const CARDS = [
  { file: "intense-eye", title: "Look closer" },
  { file: "textured-glass", title: "Glass" },
  { file: "contrasting-vision", title: "Contrast" },
  { file: "metallic-droplets", title: "Chrome" },
  { file: "close-up-eye", title: "Detail" },
]

const items = CARDS.map((card, i) => (
  <div key={card.file} className="relative size-full">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={`/demo/card-stack-scroll/${card.file}.webp`} alt="" draggable={false} className="absolute inset-0 size-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
    <div className="absolute inset-x-6 bottom-5 flex items-end justify-between text-white">
      <span className="text-3xl font-medium">{card.title}</span>
      <span className="font-mono text-xs">0{i + 1}</span>
    </div>
  </div>
))

export default function Demo(props: Pick<CardStackScrollProps, "top" | "peek" | "scaleStep" | "autoScroll">) {
  return (
    <div className="flex-1 px-4">
      <div className="flex h-[45vh] flex-col items-center justify-end gap-3 pb-10">
        <span className="text-center text-[10px] tracking-widest text-muted-foreground uppercase">
          Scroll down
          <br />
          to see the card stack
        </span>
        <span className="h-12 w-px bg-muted-foreground/50" />
      </div>
      <CardStackScroll autoScroll={160} {...props} items={items} className="mx-auto w-full max-w-2xl" />
    </div>
  )
}
