import Link from "next/link"
import { getStars } from "@/lib/github"
import { REPO_URL } from "@/lib/site"
import { Logo } from "./logo"
import { ThemeToggle } from "./theme-toggle"

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4 fill-current">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  )
}

/** Floating pill nav, fixed over the page. */
export async function Nav() {
  const stars = await getStars()
  return (
    <header className="fixed inset-x-0 top-3 z-50 px-4">
      <nav className="mx-auto flex h-12 max-w-4xl items-center gap-6 rounded-2xl border border-white/10 bg-neutral-950/70 pr-2 pl-4 text-sm text-neutral-400 backdrop-blur-xl">
        <Link href="/" className="text-neutral-50">
          <Logo />
        </Link>
        <div className="ml-auto hidden items-center gap-5 sm:flex">
          <Link href="/#components" className="transition-colors hover:text-neutral-50">
            Components
          </Link>
          <Link href="/suggest" className="transition-colors hover:text-neutral-50">
            Suggest
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-1 sm:ml-0">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white/5 px-2.5 text-neutral-300 transition-colors hover:text-neutral-50"
          >
            <GitHubIcon />
            {stars !== null && <span className="font-mono text-xs tabular-nums">{stars.toLocaleString("en")}</span>}
            <span className="sr-only">GitHub</span>
          </a>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
