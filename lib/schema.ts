import { z } from "zod"

export const CATEGORIES = ["buttons", "text", "cards", "navigation", "effects"] as const
export type Category = (typeof CATEGORIES)[number]

/** kebab-case starting with a letter, so it maps to a valid component name. */
export const SLUG_RE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/

/** Author handle: lowercase GitHub-style login, used in /@handle and authors/<handle>.json. */
export const HANDLE_RE = /^[a-z0-9](?:-?[a-z0-9])*$/
const Handle = z.string().regex(HANDLE_RE, "handle must be a lowercase GitHub-style login")

/** Props the viewer's customizer can change live. */
const ControlSchema = z.discriminatedUnion("type", [
  z.object({ prop: z.string().min(1), type: z.literal("number"), min: z.number(), max: z.number(), step: z.number().positive(), default: z.number() }),
  z.object({ prop: z.string().min(1), type: z.literal("boolean"), default: z.boolean() }),
  z
    .object({ prop: z.string().min(1), type: z.literal("select"), options: z.array(z.string()).min(2), default: z.string() })
    .refine((c) => c.options.includes(c.default), { message: "select default must be one of its options" }),
])
export type Control = z.infer<typeof ControlSchema>

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
    /** Links the credit to a page at /@handle. */
    handle: Handle.optional(),
  }),
  /** Extra people or places the reference itself credits (secondary inspirations). */
  credits: z.array(z.object({ author: z.string().min(1), url: z.url(), handle: Handle.optional() })).optional(),
  /** Credits for images used by the demo (files in public/demo/<slug>/). */
  assets: z
    .array(z.object({ file: z.string().min(1), author: z.string().min(1), source: z.url(), license: z.string().min(1) }))
    .optional(),
  dependencies: z.array(z.string()),
  props: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      default: z.string(),
      description: z.string(),
    }),
  ),
  controls: z.array(ControlSchema).optional(),
  createdAt: z.iso.date(),
})

export type Meta = z.infer<typeof MetaSchema>

/** authors/<handle>.json: a person or studio page. Without a file, the page is built from credits alone. */
export const AuthorSchema = z.object({
  handle: Handle,
  name: z.string().min(1),
  bio: z.string().optional(),
  /** GitHub login; also the default avatar. */
  github: z.string().min(1).optional(),
  x: z.string().min(1).optional(),
  site: z.url().optional(),
  /** Avatar URL when the GitHub one is not wanted. */
  avatar: z.url().optional(),
  /** True once the person opened the pull request for this file themselves. */
  claimed: z.boolean(),
})

export type Author = z.infer<typeof AuthorSchema>
