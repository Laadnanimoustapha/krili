"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface UserMenuProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    first_name?: string | null
    last_name?: string | null
  }
  language: string
  getTranslation: (lang: string, key: string) => string
}

export function UserMenu({ user, language, getTranslation }: UserMenuProps) {
  return (
    <Button
      size="sm"
      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/30 hover:scale-105 rounded-xl font-medium"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Log Out
    </Button>
  )
}
