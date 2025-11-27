import { MessagesLayout } from "@/components/messages-layout"
import { Header } from "@/components/header"

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <MessagesLayout />
      </main>
    </div>
  )
}
