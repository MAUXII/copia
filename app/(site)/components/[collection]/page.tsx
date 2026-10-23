import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { COLLECTIONS, Library } from "@/components/site/library"

type Params = { params: Promise<{ collection: string }> }

export const dynamicParams = false
export const revalidate = 600

export function generateStaticParams() {
  return [{ collection: "craft" }, { collection: "copies" }]
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const c = (await params).collection
  return c === "craft" || c === "copies" ? { title: COLLECTIONS[c].title, description: COLLECTIONS[c].intro } : {}
}

export default async function CollectionPage({ params }: Params) {
  const c = (await params).collection
  if (c !== "craft" && c !== "copies") notFound()
  return <Library collection={c} />
}
