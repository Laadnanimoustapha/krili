"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface NotificationContextType {
  unreadCount: number
  messageCount: number
  wishlistCount: number
  markNotificationsAsRead: () => void
  markMessagesAsRead: () => void
  addToWishlist: () => void
  removeFromWishlist: () => void
  addNotification: () => void
  addMessage: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [messageCount, setMessageCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)

  // Load initial counts from localStorage
  useEffect(() => {
    const savedUnreadCount = localStorage.getItem("unreadNotifications")
    const savedMessageCount = localStorage.getItem("unreadMessages")
    const savedWishlistCount = localStorage.getItem("wishlistCount")

    if (savedUnreadCount) setUnreadCount(Number.parseInt(savedUnreadCount))
    else setUnreadCount(5) // Default value

    if (savedMessageCount) setMessageCount(Number.parseInt(savedMessageCount))
    else setMessageCount(2) // Default value

    if (savedWishlistCount) setWishlistCount(Number.parseInt(savedWishlistCount))
    else setWishlistCount(3) // Default value
  }, [])

  // Save to localStorage whenever counts change
  useEffect(() => {
    localStorage.setItem("unreadNotifications", unreadCount.toString())
  }, [unreadCount])

  useEffect(() => {
    localStorage.setItem("unreadMessages", messageCount.toString())
  }, [messageCount])

  useEffect(() => {
    localStorage.setItem("wishlistCount", wishlistCount.toString())
  }, [wishlistCount])

  const markNotificationsAsRead = () => {
    setUnreadCount(0)
  }

  const markMessagesAsRead = () => {
    setMessageCount(0)
  }

  const addToWishlist = () => {
    setWishlistCount((prev) => prev + 1)
  }

  const removeFromWishlist = () => {
    setWishlistCount((prev) => Math.max(0, prev - 1))
  }

  const addNotification = () => {
    setUnreadCount((prev) => prev + 1)
  }

  const addMessage = () => {
    setMessageCount((prev) => prev + 1)
  }

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        messageCount,
        wishlistCount,
        markNotificationsAsRead,
        markMessagesAsRead,
        addToWishlist,
        removeFromWishlist,
        addNotification,
        addMessage,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
