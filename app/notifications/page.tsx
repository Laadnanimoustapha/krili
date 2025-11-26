import { Header } from "@/components/header"
import { NotificationsClient } from "@/components/notifications-client"

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <NotificationsClient />
      </main>
    </div>
  )
}
