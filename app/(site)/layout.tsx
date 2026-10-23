import { LogoMark } from "@/components/site/logo"
import { Nav } from "@/components/site/nav"
import { RidgelineFooter } from "@/components/site/ridgeline-footer"
import { REPO_URL } from "@/lib/site"

const COLUMNS = [
  {
    title: "Library",
    links: [
      { label: "Components", href: "/components" },
      { label: "Craft", href: "/components/craft", badge: "New" },
      { label: "Copies", href: "/components/copies" },
      { label: "Agents", href: "/agents" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Requests", href: "/requests" },
      { label: "Publish", href: "/publish" },
      { label: "Authors", href: "/authors" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "Docs", href: `${REPO_URL}/tree/main/docs` },
      { label: "Case studies", href: `${REPO_URL}/tree/main/knowledge/case-studies` },
      { label: "Agent skills", href: `${REPO_URL}/tree/main/.agents/skills` },
    ],
  },
  {
    title: "Project",
    links: [
      { label: "GitHub", href: REPO_URL },
      { label: "Issues", href: `${REPO_URL}/issues` },
      { label: "License", href: `${REPO_URL}/blob/main/LICENSE` },
    ],
  },
]

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main>{children}</main>
      <RidgelineFooter
        className="mt-24"
        maxWidth="none"
        logo={<LogoMark className="h-[21px] w-[26px]" />}
        tagline="Free, open-source recreations of the best interfaces on the web. Credited, one file each."
        columns={COLUMNS}
        github={REPO_URL}
        copyright={`© ${new Date().getFullYear()} Copia · MIT · Most components are credited recreations.`}
      />
    </>
  )
}
