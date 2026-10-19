import { PerspectiveCarousel } from "./perspective-carousel"

const covers = [
  { bg: "#e8342b", fg: "#170404", title: "Red", sub: "Bloom", font: "font-serif italic text-6xl" },
  { bg: "#1f3d0c", fg: "#c8e86a", title: "COLD", sub: "shade of night", font: "font-serif text-5xl uppercase" },
  { bg: "#161616", fg: "#e8342b", title: "R", sub: "fairytale", font: "font-serif italic text-8xl" },
  { bg: "#d9d6cf", fg: "#141414", title: "haunts", sub: "me still", font: "font-serif text-5xl" },
  { bg: "#2b2bff", fg: "#f2f2f2", title: "Ø1", sub: "copia records", font: "font-mono text-6xl" },
  { bg: "#f4b23a", fg: "#2a1700", title: "Sun", sub: "side B", font: "font-sans font-black text-6xl uppercase" },
]

const items = covers.map((c, i) => (
  <span key={i} className="flex size-full flex-col justify-between p-4 text-left" style={{ backgroundColor: c.bg, color: c.fg }}>
    <span className="text-[10px] tracking-widest uppercase opacity-70">Vol. {i + 1}</span>
    <span className={`leading-none ${c.font}`}>{c.title}</span>
    <span className="text-[10px] tracking-widest uppercase opacity-70">{c.sub}</span>
  </span>
))

export default function Demo() {
  return <PerspectiveCarousel items={items} size={170} autoplay={1200} pauseOnHover={false} label="Albums" />
}
