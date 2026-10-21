import { PerspectiveCarousel, type PerspectiveCarouselProps } from "./perspective-carousel"

/** Free photos from Lummi (lummi.ai); authors in meta.json → assets. */
const PHOTOS = ["crimson-contemplation", "artistic-orchid", "elegant-red-portrait", "white-flowers-on-black", "red-light-portrait", "fiery-profile"]

const items = PHOTOS.map((name) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img key={name} src={`/demo/perspective-carousel/${name}.webp`} alt="" draggable={false} className="size-full object-cover" />
))

export default function Demo(props: Pick<PerspectiveCarouselProps, "size" | "spacing" | "autoplay">) {
  return (
    <div className="grid flex-1 place-items-center overflow-hidden p-6">
      <PerspectiveCarousel size={200} autoplay={1200} {...props} items={items} pauseOnHover={false} label="Albums" />
    </div>
  )
}
