import type { MetadataRoute } from "next"

export default function sitemapIndex(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://krili.com/sitemap.xml",
      lastModified: new Date(),
    },
    {
      url: "https://krili.com/sitemap-items.xml",
      lastModified: new Date(),
    },
    {
      url: "https://krili.com/sitemap-categories.xml",
      lastModified: new Date(),
    },
  ]
}
