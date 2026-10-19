import { z } from "zod"

export const CATEGORIES = ["buttons", "text", "cards", "navigation", "effects"] as const
export type Category = (typeof CATEGORIES)[number]

/** kebab-case starting with a letter, so it maps to a valid component name. */
export const SLUG_RE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/

export const MetaSchema = z.object({
  slug: z.string().regex(SLUG_RE, "slug must be kebab-case (a-z, 0-9, hyphens)"),
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(CATEGORIES),
  tags: z.array(z.string()),
  author: z.object({ name: z.string().min(1), github: z.string().min(1) }),
  inspiration: z.object({
    author: z.string().min(1),
    url: z.url().nullable(),
  }),
  dependencies: z.array(z.string()),
  props: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      default: z.string(),
      description: z.string(),
    }),
  ),
  createdAt: z.iso.date(),
})

export type Meta = z.infer<typeof MetaSchema>
