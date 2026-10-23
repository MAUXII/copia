import { LibrarySidebar } from "@/components/site/library-sidebar"
import { PublishNudge } from "@/components/site/publish-nudge"
import { getComponents } from "@/lib/registry"

/** Shared by the three collection pages, so the sidebar and its switch stay mounted between them. */
export default function ComponentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] px-4 pt-14 md:grid-cols-[15rem_minmax(0,1fr)] md:gap-10 md:px-8">
      <LibrarySidebar all={getComponents()} />
      {children}
      <PublishNudge />
    </div>
  )
}
