import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site"

export default function robots(): MetadataRoute.Robots {
  // /preview pages exist only for recording the component previews.
  return { rules: { userAgent: "*", allow: "/", disallow: "/preview/" }, sitemap: `${SITE_URL}/sitemap.xml` }
}
