import type { Metadata } from "next"
import { Library } from "@/components/site/library"

export const metadata: Metadata = { title: "Components", description: "Copia's crafted pieces and credited copies, one file each." }

export default function ComponentsPage() {
  return <Library collection="all" />
}
