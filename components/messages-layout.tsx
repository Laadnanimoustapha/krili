"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Search, Send } from "lucide-react"
import { ChatWindow } from "@/components/chat-window"

// Mock data for conversations
const mockConversations = [
  {
    id: "1",
    participant: {
      name: "Sarah Johnson",
      avatar: "/user-avatar.png",
      initials: "SJ",
      isOnline: true,
    },
    item: {
      title: "Professional DSLR Camera",
      image: "/professional-camera.png",
    },
    lastMessage: {
      text: "Is the camera still available for next weekend?",
      timestamp: "2 min ago",
      isRead: false,
      sender: "them",
    },
    unreadCount: 2,
    type: "rental_inquiry",
  },
  {
    id: "2",
    participant: {
      name: "Mike Chen",
      avatar: "/user-avatar.png",
      initials: "MC",
      isOnline: false,
    },
    item: {
      title: "Mountain Bike - Trail Ready",
      image: "/mountain-bike-trail.png",
    },
    lastMessage: {
      text: "Thanks! I'll pick it up tomorrow at 10am",
      timestamp: "1 hour ago",
      isRead: true,
      sender: "them",
    },
    unreadCount: 0,
    type: "confirmed_booking",
  },
  {
    id: "3",
    participant: {
      name: "Emma Davis",
      avatar: "/user-avatar.png",
      initials: "ED",
      isOnline: true,
    },
    item: {
      title: "Power Drill Set",
      image: "/power-drill-set.png",
    },
    lastMessage: {
      text: "Perfect! I'll send you the payment details",
      timestamp: "3 hours ago",
      isRead: true,
      sender: "me",
    },
    unreadCount: 0,
    type: "negotiation",
  },
  {
    id: "4",
    participant: {
      name: "Alex Rodriguez",
      avatar: "/user-avatar.png",
      initials: "AR",
      isOnline: false,
    },
    item: {
      title: "Gaming Console Setup",
      image: "/playstation-5-console.png",
    },
    lastMessage: {
      text: "Could you do $40 per day instead of $50?",
      timestamp: "1 day ago",
      isRead: true,
      sender: "them",
    },
    unreadCount: 0,
    type: "price_negotiation",
  },
]

export function MessagesLayout() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredConversations = mockConversations.filter(
    (conv) =>
      conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getTypeColor = (type: string) => {
    switch (type) {
      case "rental_inquiry":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "confirmed_booking":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "negotiation":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "price_negotiation":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "rental_inquiry":
        return "Inquiry"
      case "confirmed_booking":
        return "Confirmed"
      case "negotiation":
        return "Negotiating"
      case "price_negotiation":
        return "Price Discussion"
      default:
        return "Chat"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Chat with buyers and sellers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Conversations</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[480px]">
              <div className="space-y-1 p-4">
                {filteredConversations.map((conversation, index) => (
                  <div key={conversation.id}>
                    <div
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedConversation === conversation.id ? "bg-muted" : ""
                      }`}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={conversation.participant.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{conversation.participant.initials}</AvatarFallback>
                        </Avatar>
                        {conversation.participant.isOnline && (
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-background rounded-full" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium truncate">{conversation.participant.name}</p>
                          <div className="flex items-center gap-2">
                            {conversation.unreadCount > 0 && (
                              <Badge
                                variant="destructive"
                                className="h-5 w-5 p-0 flex items-center justify-center text-xs"
                              >
                                {conversation.unreadCount}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">{conversation.lastMessage.timestamp}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <img
                            src={conversation.item.image || "/placeholder.svg"}
                            alt={conversation.item.title}
                            className="h-6 w-6 rounded object-cover"
                          />
                          <span className="text-xs text-muted-foreground truncate">{conversation.item.title}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <p
                            className={`text-sm truncate ${
                              conversation.lastMessage.isRead ? "text-muted-foreground" : "font-medium"
                            }`}
                          >
                            {conversation.lastMessage.sender === "me" ? "You: " : ""}
                            {conversation.lastMessage.text}
                          </p>
                          <Badge variant="outline" className={`text-xs ${getTypeColor(conversation.type)}`}>
                            {getTypeLabel(conversation.type)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {index < filteredConversations.length - 1 && <Separator className="my-1" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="lg:col-span-2">
          {selectedConversation ? (
            <ChatWindow conversation={mockConversations.find((c) => c.id === selectedConversation)!} />
          ) : (
            <CardContent className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Send className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                <p className="text-muted-foreground">Choose a conversation from the list to start chatting</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
