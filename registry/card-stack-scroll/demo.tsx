import { CardStackScroll } from "./card-stack-scroll"

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
    <div className="absolute inset-x-5 bottom-4 flex items-end justify-between text-white">
      <span className="text-2xl font-medium">{card.title}</span>
      <span className="font-mono text-xs">0{i + 1}</span>
    </div>
  </div>
))

export default function Demo() {
  return <CardStackScroll items={items} height={300} cardHeight={170} autoScroll={180} className="w-[400px] max-w-full rounded-2xl border bg-background" />
}
