"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, MessageCircle, Heart, Search, X } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false)

  const actions = [
    { icon: Search, label: "Search", href: "/browse", color: "bg-blue-500 hover:bg-blue-600" },
    { icon: Heart, label: "Wishlist", href: "/wishlist", color: "bg-red-500 hover:bg-red-600" },
    { icon: MessageCircle, label: "Messages", href: "/messages", color: "bg-green-500 hover:bg-green-600" },
  ]

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Action buttons */}
      <div
        className={cn(
          "flex flex-col gap-3 mb-3 transition-all duration-300",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
        )}
      >
        {actions.map((action, index) => (
          <Button
            key={action.label}
            size="sm"
            className={cn(
              "h-12 w-12 rounded-full shadow-lg transition-all duration-300",
              action.color,
              `delay-${index * 50}`,
            )}
            asChild
          >
            <Link href={action.href}>
              <action.icon className="h-5 w-5" />
              <span className="sr-only">{action.label}</span>
            </Link>
          </Button>
        ))}
      </div>

      {/* Main FAB */}
      <Button
        size="lg"
        className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-110"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={cn("transition-transform duration-300", isOpen && "rotate-45")}>
          {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </div>
      </Button>
    </div>
  )
}
