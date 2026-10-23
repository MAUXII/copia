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
import { highlightCode } from "@/lib/highlight"
import { componentName } from "@/lib/jsx"
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
      <h2 className="flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-neutral-500 uppercase">
        <span aria-hidden className="size-1.5 rounded-full bg-[#ff4d1c]" />
        {title}
      </h2>
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

/** A credit: the name opens the person's Copia page when they have one, the arrow opens their site. */
function Credit({ author, url, handle }: { author: string; url: string; handle?: string }) {
  if (!handle) return <ExternalLink href={url}>{author}</ExternalLink>
  return (
    <span className="inline-flex items-center gap-0.5">
      <Link href={`/@${handle}`} className="text-white underline-offset-4 hover:underline">
        {author}
      </Link>
      <a href={url} target="_blank" rel="noreferrer" aria-label={`${author} website`} className="text-neutral-400 hover:text-white">
        <ArrowUpRight className="size-3.5" aria-hidden />
      </a>
    </span>
  )
}

export default async function ComponentPage({ params }: Params) {
  const { slug } = await params
  const meta = getComponent(slug)
  const load = demos[slug]
  if (!meta || !load) notFound()

  const all = getComponents()
  const index = all.findIndex((m) => m.slug === slug)
  const previous = all[(index - 1 + all.length) % all.length]
  const next = all[(index + 1) % all.length]

  const registryUrl = `${SITE_URL}/r/${slug}.json`
  const usage = readSource(slug, "demo")
  const source = readSource(slug, "component")
  const interaction = meta.tags.filter((t) => INTERACTIONS.includes(t.toLowerCase()))
  const [usageHtml, sourceHtml] = await Promise.all([highlightCode(usage), highlightCode(source)])

  const info = (
    <div className="flex flex-col">
      <h1 className="text-3xl font-medium tracking-tight">{meta.name}</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-neutral-400">{meta.description}</p>
      <div className="mt-4 mb-10 flex flex-wrap gap-2">
        <CopyButton value={buildPrompt(meta, registryUrl, usage)} label="Copy prompt for your AI editor" className="h-8 w-auto gap-1.5 rounded-lg bg-[#ff4d1c]/15 px-3 text-xs text-[#ffc48a] hover:bg-[#ff4d1c]/25 hover:text-[#ffd9b3]">
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
            <span key={dep} className="rounded-md bg-[#ff4d1c]/10 px-2 py-0.5 font-mono text-[13px] text-[#ffc48a]">
              {dep}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Interaction type">
        <div className="flex flex-wrap gap-2">
          {(interaction.length ? interaction : [meta.category]).map((kind) => (
            <span key={kind} className="rounded-full bg-[#7ee8e2]/10 px-2.5 py-0.5 text-[13px] text-[#7ee8e2] capitalize">
              {kind}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Install via CLI">
        <InstallTabs target={`${NAMESPACE}/${slug}`} />
        <p className="mt-2 text-xs text-neutral-500">
          Without the namespace: <code className="font-mono text-neutral-400">npx shadcn@latest add <span className="text-[#ffc48a]">{registryUrl}</span></code>
        </p>
      </Section>

      <Section title="How to use">
        <CodeBlock code={usage} html={usageHtml} label="demo.tsx" />
      </Section>

      {meta.controls && meta.controls.length > 0 && (
        <Section title="Customization">
          Use the <span className="text-white">sliders button</span> at the top right of the preview to tweak {meta.controls.map((c) => c.prop).join(", ")} live and copy the
          generated JSX.
        </Section>
      )}

      {meta.props.length > 0 && (
        <Section title="Props">
          <PropsTable props={meta.props} />
        </Section>
      )}

      <Section title="Attribution">
        <p>
          {meta.inspiration.url ? (
            <>
              Inspired by <Credit author={meta.inspiration.author} url={meta.inspiration.url} handle={meta.inspiration.handle} />
            </>
          ) : (
            "Original component"
          )}
          {meta.credits?.map((credit) => (
            <span key={credit.url}>
              {", "}
              <Credit {...credit} />
            </span>
          ))}
          . Recreated by{" "}
          <Link href={`/@${meta.author.github.toLowerCase()}`} className="text-white underline-offset-4 hover:underline">
            {meta.author.name}
          </Link>
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
        <CodeBlock code={source} html={sourceHtml} label={`${slug}.tsx`} collapsible />
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

  return (
    <ComponentViewer
      name={meta.name}
      installTarget={`${NAMESPACE}/${slug}`}
      slug={slug}
      componentName={componentName(slug)}
      controls={meta.controls ?? []}
      info={info}
      section={{ craft: { label: "Craft", href: "/components/craft" }, copies: { label: "Copies", href: "/components/copies" } }[meta.collection]}
    />
  )
}
