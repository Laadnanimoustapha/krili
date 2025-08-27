"use client"

import { useEffect } from "react"
import { NotificationsCenter } from "@/components/notifications-center"
import { Header } from "@/components/header"
import { useNotifications } from "@/components/notification-context"

export default function NotificationsPage() {
  const { markNotificationsAsRead } = useNotifications()

  useEffect(() => {
    markNotificationsAsRead()
  }, [markNotificationsAsRead])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <NotificationsCenter />
      </main>
    </div>
  )
}
