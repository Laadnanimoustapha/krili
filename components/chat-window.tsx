"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Send, Phone, Video, Info, MoreHorizontal, Calendar, DollarSign } from "lucide-react"

interface Message {
  id: string
  text: string
  sender: "me" | "them"
  timestamp: string
  type?: "text" | "booking_request" | "price_offer" | "system"
  metadata?: any
}

interface Conversation {
  id: string
  participant: {
    name: string
    avatar: string
    initials: string
    isOnline: boolean
  }
  item: {
    title: string
    image: string
  }
  lastMessage: {
    text: string
    timestamp: string
    isRead: boolean
    sender: "me" | "them"
  }
  unreadCount: number
  type: string
}

// Mock messages for the conversation
const mockMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "1",
      text: "Hi! I'm interested in renting your DSLR camera.",
      sender: "them",
      timestamp: "10:30 AM",
      type: "text",
    },
    {
      id: "2",
      text: "Hello! Great choice. It's a Canon EOS R5 in excellent condition.",
      sender: "me",
      timestamp: "10:32 AM",
      type: "text",
    },
    {
      id: "3",
      text: "Perfect! I need it for a wedding shoot next weekend.",
      sender: "them",
      timestamp: "10:33 AM",
      type: "text",
    },
    {
      id: "4",
      text: "I'd like to book it for Saturday and Sunday. Would $90 for both days work?",
      sender: "them",
      timestamp: "10:35 AM",
      type: "booking_request",
      metadata: {
        dates: ["2024-02-10", "2024-02-11"],
        totalPrice: 90,
        dailyRate: 45,
      },
    },
    {
      id: "5",
      text: "That sounds perfect! The camera comes with two lenses and a tripod.",
      sender: "me",
      timestamp: "10:40 AM",
      type: "text",
    },
    {
      id: "6",
      text: "Is the camera still available for next weekend?",
      sender: "them",
      timestamp: "2 min ago",
      type: "text",
    },
  ],
  "2": [
    {
      id: "1",
      text: "Hey! Is your mountain bike available this weekend?",
      sender: "them",
      timestamp: "9:15 AM",
      type: "text",
    },
    {
      id: "2",
      text: "Yes, it's available! It's perfect for trail riding.",
      sender: "me",
      timestamp: "9:20 AM",
      type: "text",
    },
    {
      id: "3",
      text: "Awesome! I'll take it for Saturday. $35 for the day?",
      sender: "them",
      timestamp: "9:22 AM",
      type: "text",
    },
    {
      id: "4",
      text: "Perfect! When would you like to pick it up?",
      sender: "me",
      timestamp: "9:25 AM",
      type: "text",
    },
    {
      id: "5",
      text: "Thanks! I'll pick it up tomorrow at 10am",
      sender: "them",
      timestamp: "1 hour ago",
      type: "text",
    },
  ],
}

export function ChatWindow({ conversation }: { conversation: Conversation }) {
  const [messages, setMessages] = useState<Message[]>(mockMessages[conversation.id] || [])
  const [newMessage, setNewMessage] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: "me",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "text",
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")

    // Simulate response after a delay
    setTimeout(
      () => {
        const responses = [
          "Thanks for the message!",
          "That sounds good to me.",
          "Let me check and get back to you.",
          "Perfect! Looking forward to it.",
          "I'll confirm the details shortly.",
        ]

        const response: Message = {
          id: (Date.now() + 1).toString(),
          text: responses[Math.floor(Math.random() * responses.length)],
          sender: "them",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          type: "text",
        }

        setMessages((prev) => [...prev, response])
      },
      1000 + Math.random() * 2000,
    )
  }

  const renderMessage = (message: Message) => {
    const isMe = message.sender === "me"

    if (message.type === "booking_request") {
      return (
        <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-4`}>
          <Card className={`max-w-sm ${isMe ? "bg-primary text-primary-foreground" : ""}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Booking Request</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span>Dates:</span>
                  <span>{message.metadata.dates.join(" - ")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Total: ${message.metadata.totalPrice}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant={isMe ? "secondary" : "default"}>
                  Accept
                </Button>
                <Button size="sm" variant="outline">
                  Counter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-4`}>
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            isMe ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}
        >
          <p className="text-sm">{message.text}</p>
          <p className={`text-xs mt-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
            {message.timestamp}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={conversation.participant.avatar || "/placeholder.svg"} />
              <AvatarFallback>{conversation.participant.initials}</AvatarFallback>
            </Avatar>
            {conversation.participant.isOnline && (
              <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
            )}
          </div>
          <div>
            <h3 className="font-semibold">{conversation.participant.name}</h3>
            <div className="flex items-center gap-2">
              <img
                src={conversation.item.image || "/placeholder.svg"}
                alt={conversation.item.title}
                className="h-4 w-4 rounded object-cover"
              />
              <span className="text-sm text-muted-foreground">{conversation.item.title}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Info className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id}>{renderMessage(message)}</div>
          ))}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </>
  )
}
