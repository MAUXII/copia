import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
import { CodeTabs } from "@/components/site/code-tabs"
import { LiveDemo } from "@/components/site/live-demo"
import { PropsTable } from "@/components/site/props-table"
import { demos } from "@/lib/demos"
import { buildPrompt } from "@/lib/prompt"
import { getComponent, getComponents, readSource } from "@/lib/registry"
import { NAMESPACE, REPO_URL, SITE_URL } from "@/lib/site"

type Params = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return getComponents().map((meta) => ({ slug: meta.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const meta = getComponent((await params).slug)
  if (!meta) return {}
  return {
    title: meta.name,
    description: meta.description,
    openGraph: { images: [`/previews/${meta.slug}.webp`] },
  }
}

export default async function ComponentPage({ params }: Params) {
  const { slug } = await params
  const meta = getComponent(slug)
  const load = demos[slug]
  if (!meta || !load) notFound()
  const { default: Demo } = await load()

  const registryUrl = `${SITE_URL}/r/${slug}.json`
  const demoSource = readSource(slug, "demo")
  const install = [`npx shadcn@latest add ${NAMESPACE}/${slug}`, "", "# or, without the namespace:", `npx shadcn@latest add ${registryUrl}`].join("\n")

  return (
    <div className="mx-auto max-w-5xl px-4 pt-28">
      <Link href="/#components" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" aria-hidden />
        All components
      </Link>

      <header className="mt-6 mb-8 flex flex-col gap-3">
        <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">{meta.name}</h1>
        <p className="max-w-xl text-muted-foreground">{meta.description}</p>
      </header>

      <LiveDemo>
        <Demo />
      </LiveDemo>

      <section className="mt-8">
        <CodeTabs
          tabs={[
            { id: "install", label: "Install", content: install },
            { id: "code", label: "Code", content: readSource(slug, "component") },
            { id: "usage", label: "Usage", content: demoSource },
            { id: "prompt", label: "Prompt", content: buildPrompt(meta, registryUrl, demoSource) },
          ]}
        />
      </section>

      {meta.props.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-medium">Props</h2>
          <PropsTable props={meta.props} />
        </section>
      )}

      <section className="mt-12 flex flex-col gap-1 rounded-2xl border p-5 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span className="text-muted-foreground">
          {meta.inspiration.url ? (
            <>
              Inspired by{" "}
              <a href={meta.inspiration.url} target="_blank" rel="noreferrer" className="text-foreground underline-offset-4 hover:underline">
                {meta.inspiration.author}
                <ArrowUpRight className="ml-0.5 inline size-3.5" aria-hidden />
              </a>
            </>
          ) : (
            "Original component"
          )}
          {" · "}recreated by{" "}
          <a href={`https://github.com/${meta.author.github}`} className="text-foreground underline-offset-4 hover:underline">
            {meta.author.name}
          </a>
        </span>
        <a href={`${REPO_URL}/tree/main/registry/${slug}`} className="text-muted-foreground hover:text-foreground">
          View source on GitHub
        </a>
      </section>
    </div>
  )
}
