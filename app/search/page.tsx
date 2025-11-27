import { SearchFilters } from "@/components/search-filters"
import { SearchResults } from "@/components/search-results"
import { generateSEOMetadata, generateBreadcrumbStructuredData } from "@/components/seo-head"
import type { Metadata } from "next"

export const metadata: Metadata = generateSEOMetadata({
  title: "Search Rentals - Find Anything You Need",
  description:
    "Search thousands of rental items available in your area. Find tools, electronics, vehicles, equipment and more from trusted local owners.",
  keywords: [
    "search rentals",
    "find rental items",
    "rental search",
    "browse rentals",
    "local rentals",
    "rental marketplace search",
  ],
  url: "/search",
})

export default function SearchPage() {
  return (
    <div className="container py-8">
      {generateBreadcrumbStructuredData([
        { name: "Home", url: "/" },
        { name: "Search", url: "/search" },
      ])}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-80">
          <SearchFilters />
        </aside>

        {/* Search Results */}
        <div className="flex-1">
          <SearchResults />
        </div>
      </div>
    </div>
  )
}
