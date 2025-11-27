"use client"

import { signOut } from "next-auth/react"

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
    <button
      onClick={() => {
        console.log('--- SIGN OUT TEST CLICKED ---');
        signOut({ callbackUrl: '/' });
      }}
      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200"
    >
      PERMANENT LOGOUT TEST
    </button>
  )
}
