import { Header } from "@/components/header"
import { SearchFilters } from "@/components/search-filters"
import { SearchResults } from "@/components/search-results"
import { Footer } from "@/components/footer"
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
    <div className="min-h-screen bg-background">
      {generateBreadcrumbStructuredData([
        { name: "Home", url: "/" },
        { name: "Search", url: "/search" },
      ])}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SearchResultsPage",
            name: "Krili Search Results",
            description: "Search results for rental items on Krili marketplace",
            url: "https://krili.com/search",
            mainEntity: {
              "@type": "ItemList",
              name: "Rental Items Search Results",
              description: "List of available rental items matching search criteria",
            },
            potentialAction: {
              "@type": "SearchAction",
              target: "https://krili.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Rental Items Collection",
            description: "Browse and search through thousands of rental items",
            url: "https://krili.com/search",
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: "1000+",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Tools & Equipment",
                  description: "Power tools, hand tools, construction equipment",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Electronics & Cameras",
                  description: "Cameras, audio equipment, computers, gaming",
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: "Sports & Recreation",
                  description: "Bikes, outdoor gear, fitness equipment",
                },
                {
                  "@type": "ListItem",
                  position: 4,
                  name: "Vehicles & Transportation",
                  description: "Cars, motorcycles, boats, trailers",
                },
              ],
            },
          }),
        }}
      />

      <Header />
      <main className="container py-8">
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
      </main>
      <Footer />
    </div>
  )
}
