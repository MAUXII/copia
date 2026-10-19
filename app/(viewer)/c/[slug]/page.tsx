import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowUpRight, ChevronLeft, ChevronRight, Mail } from "lucide-react"
import { CopyButton } from "@/components/site/copy-button"
import { PropsTable } from "@/components/site/props-table"
import { CodeBlock } from "@/components/site/viewer/code-block"
import { ComponentViewer } from "@/components/site/viewer/component-viewer"
import { InstallTabs } from "@/components/site/viewer/install-command"
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
  return { title: meta.name, description: meta.description, openGraph: { images: [`/previews/${meta.slug}.webp`] } }
}

const INTERACTIONS = ["hover", "cursor", "scroll", "click", "drag", "keyboard", "spring", "morph", "loop"]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 py-7 first:pt-0">
      <h2 className="font-mono text-[11px] tracking-[0.14em] text-neutral-500 uppercase">{title}</h2>
      <div className="text-[15px] leading-relaxed text-neutral-300">{children}</div>
    </section>
  )
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-white underline-offset-4 hover:underline">
      {children}
      <ArrowUpRight className="size-3.5" aria-hidden />
    </a>
  )
}

export default async function ComponentPage({ params }: Params) {
  const { slug } = await params
  const meta = getComponent(slug)
  const load = demos[slug]
  if (!meta || !load) notFound()
  const { default: Demo } = await load()

  const all = getComponents()
  const index = all.findIndex((m) => m.slug === slug)
  const previous = all[(index - 1 + all.length) % all.length]
  const next = all[(index + 1) % all.length]

  const registryUrl = `${SITE_URL}/r/${slug}.json`
  const usage = readSource(slug, "demo")
  const source = readSource(slug, "component")
  const interaction = meta.tags.filter((t) => INTERACTIONS.includes(t.toLowerCase()))

  const info = (
    <div className="flex flex-col">
      <h1 className="text-3xl font-medium tracking-tight">{meta.name}</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-neutral-400">{meta.description}</p>
      <div className="mt-4 mb-10 flex flex-wrap gap-2">
        <CopyButton value={buildPrompt(meta, registryUrl, usage)} label="Copy prompt for your AI editor" className="h-8 w-auto gap-1.5 rounded-lg bg-white/[0.06] px-3 text-xs text-neutral-300 hover:bg-white/10">
          Copy prompt
        </CopyButton>
        <span className="self-center text-xs text-neutral-500">Copy a ready prompt for Claude Code, Codex or Cursor</span>
      </div>

      <Section title="Seen on">
        {meta.inspiration.url ? <ExternalLink href={meta.inspiration.url}>{meta.inspiration.author}</ExternalLink> : "Original to Copia"}
      </Section>

      <Section title="Dependencies">
        <div className="flex flex-wrap gap-2">
          {["react", "tailwindcss", ...meta.dependencies].map((dep) => (
            <span key={dep} className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[13px]">
              {dep}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Interaction type">{interaction.length ? interaction.join(" · ") : meta.category}</Section>

      <Section title="Install via CLI">
        <InstallTabs target={`${NAMESPACE}/${slug}`} />
        <p className="mt-2 text-xs text-neutral-500">
          Without the namespace: <code className="font-mono">npx shadcn@latest add {registryUrl}</code>
        </p>
      </Section>

      <Section title="How to use">
        <CodeBlock code={usage} label="demo.tsx" />
      </Section>

      {meta.props.length > 0 && (
        <Section title="Props">
          <PropsTable props={meta.props} />
        </Section>
      )}

      <Section title="Attribution">
        <p>
          {meta.inspiration.url ? (
            <>
              Inspired by <ExternalLink href={meta.inspiration.url}>{meta.inspiration.author}</ExternalLink>
            </>
          ) : (
            "Original component"
          )}
          {meta.credits?.map((credit) => (
            <span key={credit.url}>
              {", "}
              <ExternalLink href={credit.url}>{credit.author}</ExternalLink>
            </span>
          ))}
          . Recreated by{" "}
          <a href={`https://github.com/${meta.author.github}`} className="text-white underline-offset-4 hover:underline">
            {meta.author.name}
          </a>
          .
        </p>
        {meta.assets && meta.assets.length > 0 && (
          <p className="mt-2 text-sm text-neutral-500">
            Demo images by{" "}
            {[...new Map(meta.assets.map((a) => [a.author, a])).values()].map((asset, i, list) => (
              <span key={asset.author}>
                <a href={asset.source} target="_blank" rel="noreferrer" className="underline-offset-4 hover:text-white hover:underline">
                  {asset.author}
                </a>
                {i < list.length - 1 ? ", " : ""}
              </span>
            ))}
            .
          </p>
        )}
        <p className="mt-2 text-sm">
          <a href={`${REPO_URL}/blob/main/knowledge/case-studies/${slug}.md`} className="text-neutral-400 underline-offset-4 hover:text-white hover:underline">
            Read how it was reverse engineered
          </a>
        </p>
      </Section>

      <Section title="Source code">
        <CodeBlock code={source} label={`${slug}.tsx`} collapsible />
      </Section>

      <Section title="Keep in mind">
        Most components here are recreations of the best interfaces out there. We don&apos;t claim to be the original creators: this is our attempt to reverse engineer, replicate and often add a
        few features. We credit everyone we can; if we missed someone, let us know.
      </Section>

      <Section title="Contact">
        Found a bug or a missing credit?{" "}
        <a href={`${REPO_URL}/issues/new/choose`} className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-sm text-white hover:bg-white/15">
          <Mail className="size-3.5" aria-hidden /> Open an issue
        </a>
      </Section>

      <Section title="License & usage">
        <ul className="flex flex-col gap-1.5">
          <li>— Free to use and modify in personal and commercial projects (MIT).</li>
          <li>— No attribution required, but a link back to Copia is appreciated.</li>
          <li>— Demo images are not part of the license; replace them with your own.</li>
        </ul>
      </Section>

      <nav className="mt-8 flex justify-between text-sm">
        <Link href={`/c/${previous.slug}`} className="group flex flex-col gap-1">
          <span className="flex items-center gap-1 font-mono text-[11px] tracking-[0.14em] text-neutral-500 uppercase">
            <ChevronLeft className="size-3.5" aria-hidden /> Previous
          </span>
          <span className="text-neutral-200 group-hover:text-white">{previous.name}</span>
        </Link>
        <Link href={`/c/${next.slug}`} className="group flex flex-col items-end gap-1">
          <span className="flex items-center gap-1 font-mono text-[11px] tracking-[0.14em] text-neutral-500 uppercase">
            Next <ChevronRight className="size-3.5" aria-hidden />
          </span>
          <span className="text-neutral-200 group-hover:text-white">{next.name}</span>
        </Link>
      </nav>
    </div>
  )

  return <ComponentViewer name={meta.name} installTarget={`${NAMESPACE}/${slug}`} preview={<Demo />} info={info} />
}
