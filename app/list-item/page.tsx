import { ListItemForm } from "@/components/list-item-form"
import { Header } from "@/components/header"

export default function ListItemPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-balance">List Your Item</h1>
            <p className="text-muted-foreground mt-2">Share your item with the Krili community and start earning</p>
          </div>
          <ListItemForm />
        </div>
      </main>
    </div>
  )
}
