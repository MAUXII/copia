import Link from "next/link"
import { Logo } from "@/components/site/logo"
import { Nav } from "@/components/site/nav"
import { REPO_URL } from "@/lib/site"

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main>{children}</main>
      <footer className="mx-auto mt-24 flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t px-4 py-8 text-xs text-muted-foreground">
        <Logo className="text-foreground" />
        <span>Free and open source (MIT). Most components are credited recreations.</span>
        <span className="flex gap-4">
          <Link href="/suggest" className="hover:text-foreground">
            Suggest
          </Link>
          <a href={REPO_URL} className="hover:text-foreground">
            GitHub
          </a>
        </span>
      </footer>
    </>
  )
}
