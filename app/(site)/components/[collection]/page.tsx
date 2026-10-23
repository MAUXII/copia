import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { COLLECTIONS, Library } from "@/components/site/library"

type Params = { params: Promise<{ collection: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return [{ collection: "craft" }, { collection: "copies" }, { collection: "agents" }]
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const c = (await params).collection
  return c === "craft" || c === "copies" || c === "agents" ? { title: COLLECTIONS[c].title, description: COLLECTIONS[c].intro } : {}
}

export default async function CollectionPage({ params }: Params) {
  const c = (await params).collection
  if (c !== "craft" && c !== "copies" && c !== "agents") notFound()
  return <Library collection={c} />
}
