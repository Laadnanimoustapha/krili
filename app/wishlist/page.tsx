import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { WishlistClient } from "@/components/wishlist-client"

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <WishlistClient />
      </main>
      <Footer />
    </div>
  )
}
