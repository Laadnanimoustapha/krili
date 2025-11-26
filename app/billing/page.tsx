import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BillingClient } from "@/components/billing-client"

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <BillingClient />
      </main>
      <Footer />
    </div>
  )
}
