import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { demos } from "@/lib/demos"
import { getComponents } from "@/lib/registry"

export const dynamicParams = false
export const metadata: Metadata = { robots: { index: false, follow: false } }

export function generateStaticParams() {
  return getComponents().map((meta) => ({ slug: meta.slug }))
}

/** `?theme=light` renders the demo in the light theme, for the light preview recording. */
export default async function PreviewPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ theme?: string }> }) {
  const { slug } = await params
  const theme = (await searchParams).theme === "light" ? "light" : "dark"
  const load = demos[slug]
  if (!load) notFound()
  const { default: Demo } = await load()
  return (
    <main className={`${theme} flex min-h-screen w-full flex-col bg-background text-foreground`}>
      <Demo />
    </main>
  )
}
