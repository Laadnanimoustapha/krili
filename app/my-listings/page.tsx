import { MyListings } from "@/components/my-listings"
import { Header } from "@/components/header"

export default function MyListingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <MyListings />
      </main>
    </div>
  )
}
