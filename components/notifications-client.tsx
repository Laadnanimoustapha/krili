"use client"

import { useEffect } from "react"
import { NotificationsCenter } from "@/components/notifications-center"
import { useNotifications } from "@/components/notification-context"

export function NotificationsClient() {
    const { markNotificationsAsRead } = useNotifications()

    useEffect(() => {
        markNotificationsAsRead()
    }, [markNotificationsAsRead])

    return (
        <div className="container mx-auto px-4 py-8">
            <NotificationsCenter />
        </div>
    )
}
