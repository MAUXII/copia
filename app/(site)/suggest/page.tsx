import type { Metadata } from "next"
import { SuggestForm } from "@/components/site/suggest-form"

export const metadata: Metadata = {
  title: "Suggest a component",
  description: "Suggest a component for Copia, or tell us about a pull request you opened.",
}

export default function SuggestPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-32">
      <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">
        Add to the <span className="font-serif font-light italic">pile</span>.
      </h1>
      <p className="mt-4 text-muted-foreground">
        Seen a component you love? Suggest it and someone (or their AI) can recreate it. Already built it? Open a pull request and let us know here.
      </p>
      <SuggestForm />
    </div>
  )
}
