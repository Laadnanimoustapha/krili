import { Header } from "@/components/header"
import { ItemDetails } from "@/components/item-details"
import { Footer } from "@/components/footer"

export default function ItemPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <ItemDetails itemId={params.id} />
      </main>
      <Footer />
    </div>
  )
}
