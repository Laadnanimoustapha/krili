"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  MoreVertical,
  Send,
  Search,
  X,
  Info,
  Bell,
  BellOff,
  UserX,
  Flag,
  Trash2,
  CheckCheck,
  Loader2,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface Message {
  id: number
  text: string
  type: "sent" | "received"
  time: string
  timestamp: string
  status?: string
}

const CHAT_STORAGE_KEY = "krili_chat_messages"

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showTypingIndicator, setShowTypingIndicator] = useState(false)
  const [userStatus, setUserStatus] = useState("Online now")
  const [isOnline, setIsOnline] = useState(true)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Message[]>([])
  const [notificationsMuted, setNotificationsMuted] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [notification, setNotification] = useState<{ message: string; type: string } | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const router = useRouter()

  // Load messages and preferences on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY)
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages))
    }

    const muted = localStorage.getItem("chat_notifications_muted") === "true"
    setNotificationsMuted(muted)

    // Show welcome tip
    setTimeout(() => {
      showNotification("💡 Tip: Use Ctrl+K to search messages, Escape to close panels", "success")
    }, 1000)

    // Update user status periodically
    const statusInterval = setInterval(updateUserStatus, 30000)
    return () => clearInterval(statusInterval)
  }, [])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages, showTypingIndicator])

  // Save messages when they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages))
    }
  }, [messages])

  // Handle search
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = messages.filter((msg) => msg.text.toLowerCase().includes(searchQuery.toLowerCase()))
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }, [searchQuery, messages])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setShowSearch(true)
      }
      if (e.key === "Escape") {
        setShowSearch(false)
        setSearchQuery("")
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const getCurrentTime = () => {
    const now = new Date()
    return now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0")
  }

  const showNotification = (message: string, type = "success", duration = 3500) => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), duration)
  }

  const updateUserStatus = () => {
    const statuses = [
      { text: "Online now", online: true },
      { text: "Last seen 2 minutes ago", online: false },
      { text: "Typing...", online: true },
      { text: "Online now", online: true },
    ]

    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
    setUserStatus(randomStatus.text)
    setIsOnline(randomStatus.online)
  }

  const handleInputChange = (value: string) => {
    setMessageInput(value)

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px"
    }

    // Handle typing indicator
    if (value.trim() && !isTyping) {
      setIsTyping(true)
      setShowTypingIndicator(true)
    } else if (!value.trim() && isTyping) {
      setIsTyping(false)
      setShowTypingIndicator(false)
    }

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Hide typing indicator after 3 seconds of no typing
    if (value.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false)
        setShowTypingIndicator(false)
      }, 3000)
    }
  }

  const sendMessage = async () => {
    const message = messageInput.trim()
    if (!message) {
      showNotification("Please enter a message", "warning")
      return
    }

    setIsSending(true)
    setIsTyping(false)
    setShowTypingIndicator(false)

    const messageData: Message = {
      id: Date.now(),
      text: message,
      type: "sent",
      time: getCurrentTime(),
      timestamp: new Date().toISOString(),
      status: "Sending...",
    }

    // Add message immediately
    setMessages((prev) => [...prev, messageData])
    setMessageInput("")

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "50px"
    }

    // Simulate sending delay
    setTimeout(() => {
      setIsSending(false)
      setMessages((prev) => prev.map((msg) => (msg.id === messageData.id ? { ...msg, status: "Delivered" } : msg)))

      // Update to read status
      setTimeout(() => {
        setMessages((prev) => prev.map((msg) => (msg.id === messageData.id ? { ...msg, status: "Read" } : msg)))
      }, 1000)

      // Simulate reply
      setTimeout(simulateReply, 2000 + Math.random() * 2000)
    }, 800)
  }

  const simulateReply = () => {
    const replies = [
      "Yes, that works perfectly for me! 👍",
      "I can definitely arrange that for you.",
      "The MacBook will be fully charged and ready to go.",
      "I usually meet near the city center for convenience.",
      "Would Tuesday afternoon work better for you?",
      "I'll include the charger and original box of course.",
      "Sure, let me know what time works best for your schedule.",
      "That sounds great! Looking forward to it.",
      "Perfect! I'll make sure everything is ready.",
      "No problem at all, happy to help! 😊",
    ]

    const randomReply = replies[Math.floor(Math.random() * replies.length)]

    // Show typing indicator first
    setShowTypingIndicator(true)

    setTimeout(
      () => {
        setShowTypingIndicator(false)

        const messageData: Message = {
          id: Date.now(),
          text: randomReply,
          type: "received",
          time: getCurrentTime(),
          timestamp: new Date().toISOString(),
        }

        setMessages((prev) => [...prev, messageData])

        if (!notificationsMuted) {
          showNotification("New message received", "success")
        }
      },
      1500 + Math.random() * 1000,
    )
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    if (confirm("Are you sure you want to clear all messages? This action cannot be undone.")) {
      setMessages([])
      localStorage.removeItem(CHAT_STORAGE_KEY)
      showNotification("Chat cleared successfully", "success")
    }
  }

  const toggleNotifications = () => {
    const newMuted = !notificationsMuted
    setNotificationsMuted(newMuted)
    localStorage.setItem("chat_notifications_muted", newMuted.toString())
    showNotification(newMuted ? "Notifications muted" : "Notifications enabled", newMuted ? "warning" : "success")
  }

  const blockUser = () => {
    if (confirm("Are you sure you want to block يوسف العلوي? You will no longer receive messages from this user.")) {
      showNotification("User blocked successfully", "warning")
    }
  }

  const reportUser = () => {
    const reason = prompt("Please specify the reason for reporting this user:")
    if (reason && reason.trim()) {
      showNotification("User reported. Thank you for keeping our community safe.", "success")
    }
  }

  const highlightSearchText = (text: string, query: string) => {
    if (!query) return text
    const regex = new RegExp(`(${query})`, "gi")
    return text.replace(regex, "<mark>$1</mark>")
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder.svg" alt="يوسف العلوي" />
            <AvatarFallback>يع</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">يوسف العلوي</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`} />
              <span>{userStatus}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)}>
            <Search className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push("/item/1")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Item
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => showNotification("User Info: يوسف العلوي - Rating: 4.8/5", "success")}>
                <Info className="h-4 w-4 mr-2" />
                User Info
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleNotifications}>
                {notificationsMuted ? <BellOff className="h-4 w-4 mr-2" /> : <Bell className="h-4 w-4 mr-2" />}
                {notificationsMuted ? "Unmute" : "Mute"} Notifications
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={blockUser}>
                <UserX className="h-4 w-4 mr-2" />
                Block User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={reportUser}>
                <Flag className="h-4 w-4 mr-2" />
                Report User
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={clearChat} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === "sent" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === "sent" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <div className="flex items-center justify-between mt-1 text-xs opacity-70">
                <span>{message.time}</span>
                {message.type === "sent" && message.status && (
                  <div className="flex items-center gap-1">
                    <CheckCheck className={`h-3 w-3 ${message.status === "Read" ? "text-green-400" : ""}`} />
                    <span>{message.status}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {showTypingIndicator && (
          <div className="flex justify-start">
            <div className="bg-muted text-muted-foreground px-4 py-2 rounded-lg max-w-xs">
              <div className="flex items-center gap-2">
                <span className="text-sm">يوسف is typing</span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-background">
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={messageInput}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="min-h-[50px] max-h-[120px] resize-none"
            rows={1}
          />
          <Button onClick={sendMessage} disabled={isSending || !messageInput.trim()} size="icon">
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Search Panel */}
      {showSearch && (
        <div className="absolute inset-0 bg-background z-50">
          <div className="flex items-center gap-2 p-4 border-b">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="flex-1"
              autoFocus
            />
            <Button variant="ghost" size="icon" onClick={() => setShowSearch(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4">
            {!searchQuery.trim() ? (
              <div className="text-center text-muted-foreground py-8">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Type to search messages...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No messages found for "{searchQuery}"</p>
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map((result) => (
                  <Card key={result.id} className="cursor-pointer hover:bg-muted/50">
                    <CardContent className="p-3">
                      <div
                        className="text-sm"
                        dangerouslySetInnerHTML={{
                          __html: highlightSearchText(result.text, searchQuery),
                        }}
                      />
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>{result.type === "sent" ? "You" : "يوسف العلوي"}</span>
                        <span>{result.time}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : notification.type === "warning"
                ? "bg-yellow-500 text-white"
                : "bg-red-500 text-white"
          }`}
        >
          {notification.message}
        </div>
      )}
    </div>
  )
}
