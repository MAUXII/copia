import { CursorTrail, type CursorTrailProps } from "./cursor-trail"

/** Stickers by David Denni (befreaky.co), the site this effect comes from. See meta.json → assets. */
const STICKERS = ["miro", "amazon", "wearos", "microsoft", "peer", "zonda", "skidubai", "trefontane", "lfc", "dac", "marcomartini", "bg"]

const items = STICKERS.map((name) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img key={name} src={`/demo/cursor-trail/${name}.svg`} alt="" draggable={false} className="size-full object-contain drop-shadow-lg" />
))

export default function Demo(props: Pick<CursorTrailProps, "spacing" | "lifetime" | "max" | "size">) {
  return (
    <CursorTrail size={110} spacing={45} {...props} items={items} className="grid flex-1 place-items-center">
      <span className="text-center text-[10px] tracking-widest text-muted-foreground uppercase">
        Move your mouse
        <br />
        to see the trail
      </span>
    </CursorTrail>
  )
}
