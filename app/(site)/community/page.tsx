import type { Metadata } from "next"
import Link from "next/link"
import { Lightbulb, Upload, Users } from "lucide-react"

export const metadata: Metadata = { title: "Community", description: "Request components, publish yours and meet everyone Copia credits." }

const PARTS = [
  { href: "/requests", title: "Requests", text: "Ask for a component, vote on the ones you want, or pick one and build it with your agent.", icon: Lightbulb },
  { href: "/publish", title: "Publish", text: "Copy something great or craft your own; send it as a pull request and it lands on your page.", icon: Upload },
  { href: "/authors", title: "Authors", text: "Everyone who made the originals and everyone who recreated them, each with a page.", icon: Users },
]

export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-32">
      <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">
        Community<span className="font-serif font-light italic">.</span>
      </h1>
      <p className="mt-4 text-muted-foreground">Copia grows by people asking, building and crediting each other.</p>
      <ul className="mt-12 flex flex-col gap-3">
        {PARTS.map(({ href, title, text, icon: Icon }) => (
          <li key={href}>
            <Link href={href} className="flex items-start gap-4 rounded-2xl bg-muted/50 p-5 transition-colors hover:bg-muted">
              <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
              <span className="flex flex-col gap-1">
                <span className="font-medium">{title}</span>
                <span className="text-sm text-muted-foreground">{text}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
