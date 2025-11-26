import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { KYCClient } from "@/components/kyc-client"

export default function KYCPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <KYCClient />
      </main>
      <Footer />
    </div>
  )
}
