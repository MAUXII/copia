import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { demos } from "@/lib/demos"
import { getComponents } from "@/lib/registry"

export const dynamicParams = false
export const metadata: Metadata = { robots: { index: false, follow: false } }

export function generateStaticParams() {
  return getComponents().map((meta) => ({ slug: meta.slug }))
}

export default async function PreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const load = demos[slug]
  if (!load) notFound()
  const { default: Demo } = await load()
  return (
    <main className="dark grid min-h-screen place-items-center bg-background p-4 text-foreground">
      <Demo />
    </main>
  )
}
