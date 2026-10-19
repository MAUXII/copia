import { CardStackScroll } from "./card-stack-scroll"

const cards = [
  { bg: "linear-gradient(135deg,#1b1b1b,#3a3a3a)", title: "Look closer", tag: "01" },
  { bg: "linear-gradient(135deg,#9fd3ff,#f3c9b1)", title: "Glass", tag: "02" },
  { bg: "linear-gradient(135deg,#2c2c2c,#8a8a8a)", title: "Motion", tag: "03" },
  { bg: "linear-gradient(135deg,#050505,#262626)", title: "Chrome", tag: "04" },
  { bg: "linear-gradient(135deg,#e9e9e9,#b8b8b8)", title: "Light", tag: "05" },
]

const items = cards.map((c) => (
  <div key={c.tag} className="flex size-full items-end justify-between p-5" style={{ background: c.bg }}>
    <span className="text-2xl font-medium text-white mix-blend-difference">{c.title}</span>
    <span className="font-mono text-xs text-white mix-blend-difference">{c.tag}</span>
  </div>
))

export default function Demo() {
  return <CardStackScroll items={items} height={300} cardHeight={170} autoScroll={180} className="w-[400px] max-w-full rounded-2xl border bg-background" />
}
