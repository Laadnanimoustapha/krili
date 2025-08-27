"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, MessageSquare, Calendar, DollarSign, Star, CheckCircle, X } from "lucide-react"

interface Notification {
  id: string
  type: "message" | "booking" | "payment" | "review" | "system"
  title: string
  description: string
  timestamp: string
  isRead: boolean
  avatar?: string
  initials?: string
  actionRequired?: boolean
  metadata?: any
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "message",
    title: "New message from Sarah Johnson",
    description: "Is the camera still available for next weekend?",
    timestamp: "2 minutes ago",
    isRead: false,
    avatar: "/user-avatar.png",
    initials: "SJ",
    actionRequired: true,
  },
  {
    id: "2",
    type: "booking",
    title: "Booking confirmed",
    description: "Mike Chen confirmed the mountain bike rental for tomorrow",
    timestamp: "1 hour ago",
    isRead: false,
    avatar: "/user-avatar.png",
    initials: "MC",
  },
  {
    id: "3",
    type: "payment",
    title: "Payment received",
    description: "You received $90 for the DSLR camera rental",
    timestamp: "3 hours ago",
    isRead: true,
    metadata: { amount: 90 },
  },
  {
    id: "4",
    type: "review",
    title: "New review received",
    description: "Emma Davis left you a 5-star review",
    timestamp: "1 day ago",
    isRead: true,
    avatar: "/user-avatar.png",
    initials: "ED",
    metadata: { rating: 5 },
  },
  {
    id: "5",
    type: "booking",
    title: "Booking request",
    description: "Alex Rodriguez wants to rent your gaming console",
    timestamp: "2 days ago",
    isRead: true,
    avatar: "/user-avatar.png",
    initials: "AR",
    actionRequired: true,
  },
  {
    id: "6",
    type: "system",
    title: "Profile verification complete",
    description: "Your KYC verification has been approved",
    timestamp: "3 days ago",
    isRead: true,
  },
]

export function NotificationsCenter() {
  const [notifications, setNotifications] = useState(mockNotifications)

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const actionRequiredCount = notifications.filter((n) => n.actionRequired && !n.isRead).length

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-5 w-5" />
      case "booking":
        return <Calendar className="h-5 w-5" />
      case "payment":
        return <DollarSign className="h-5 w-5" />
      case "review":
        return <Star className="h-5 w-5" />
      case "system":
        return <Bell className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getIconColor = (type: string) => {
    switch (type) {
      case "message":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400"
      case "booking":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400"
      case "payment":
        return "text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-400"
      case "review":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400"
      case "system":
        return "text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400"
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400"
    }
  }

  const NotificationCard = ({ notification }: { notification: Notification }) => (
    <Card className={`transition-colors ${!notification.isRead ? "bg-muted/30" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {notification.avatar ? (
              <Avatar className="h-10 w-10">
                <AvatarImage src={notification.avatar || "/placeholder.svg"} />
                <AvatarFallback>{notification.initials}</AvatarFallback>
              </Avatar>
            ) : (
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${getIconColor(notification.type)}`}
              >
                {getIcon(notification.type)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <h4 className={`font-medium ${!notification.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                {notification.title}
              </h4>
              <div className="flex items-center gap-2 ml-2">
                {!notification.isRead && <div className="h-2 w-2 bg-primary rounded-full" />}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteNotification(notification.id)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-2">{notification.description}</p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{notification.timestamp}</span>

              <div className="flex items-center gap-2">
                {notification.actionRequired && !notification.isRead && (
                  <Badge variant="destructive" className="text-xs">
                    Action Required
                  </Badge>
                )}

                {notification.metadata?.amount && (
                  <Badge variant="outline" className="text-xs">
                    ${notification.metadata.amount}
                  </Badge>
                )}

                {notification.metadata?.rating && (
                  <Badge variant="outline" className="text-xs">
                    {notification.metadata.rating} ⭐
                  </Badge>
                )}

                {!notification.isRead && (
                  <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)} className="text-xs h-6">
                    Mark as read
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with your rental activity</p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{notifications.length}</p>
                <p className="text-sm text-muted-foreground">Total Notifications</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{unreadCount}</p>
                <p className="text-sm text-muted-foreground">Unread</p>
              </div>
              <div className="h-12 w-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <Bell className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{actionRequiredCount}</p>
                <p className="text-sm text-muted-foreground">Action Required</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                <Bell className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {notifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {notifications
            .filter((n) => !n.isRead)
            .map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          {notifications
            .filter((n) => n.type === "message")
            .map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          {notifications
            .filter((n) => n.type === "booking")
            .map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
