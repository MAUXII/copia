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
          <Link href="/authors" className="hover:text-foreground">
            Authors
          </Link>
          <Link href="/requests" className="hover:text-foreground">
            Requests
          </Link>
          <Link href="/publish" className="hover:text-foreground">
            Publish
          </Link>
          <a href={REPO_URL} className="hover:text-foreground">
            GitHub
          </a>
        </span>
      </footer>
    </>
  )
}
