"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"

interface WishlistButtonProps {
  itemId: string
  isInWishlist?: boolean
  className?: string
}

export function WishlistButton({ itemId, isInWishlist = false, className }: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(isInWishlist)
  const [isLoading, setIsLoading] = useState(false)

  const toggleWishlist = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      setIsWishlisted(!isWishlisted)
    } catch (error) {
      console.error("Failed to update wishlist:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleWishlist}
      disabled={isLoading}
      className={cn(
        "h-8 w-8 p-0 hover:bg-red-50 hover:text-red-500 transition-all duration-200",
        isWishlisted && "text-red-500",
        className,
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-all duration-200",
          isWishlisted && "fill-red-500",
          isLoading && "animate-pulse",
        )}
      />
    </Button>
  )
}
