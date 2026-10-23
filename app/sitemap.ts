import type { MetadataRoute } from "next"
import { getPeople } from "@/lib/authors"
import { getComponents } from "@/lib/registry"
import { SITE_URL } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/components", "/components/craft", "/components/copies", "/components/agents", "/guides", "/requests", "/publish", "/authors"]
  return [
    ...pages.map((p) => ({ url: `${SITE_URL}${p}` })),
    ...getComponents().map((m) => ({ url: `${SITE_URL}/c/${m.slug}`, lastModified: m.createdAt })),
    ...getPeople().map((p) => ({ url: `${SITE_URL}/@${p.handle}` })),
  ]
}
