import { Header } from "@/components/header"
import { SearchFilters } from "@/components/search-filters"
import { SearchResults } from "@/components/search-results"
import { Footer } from "@/components/footer"

export default function BrowsePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse Items</h1>
          <p className="text-muted-foreground">Discover amazing items available for rent</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-80">
            <SearchFilters />
          </aside>

          {/* Browse Results */}
          <div className="flex-1">
            <SearchResults />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
