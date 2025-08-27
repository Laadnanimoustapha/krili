import { Header } from "@/components/header"
import { SearchFilters } from "@/components/search-filters"
import { SearchResults } from "@/components/search-results"
import { Footer } from "@/components/footer"

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background">
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
