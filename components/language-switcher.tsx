"use client"

import { useState, useEffect } from "react"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
    const [language, setLanguage] = useState("en")
    const [mounted, setMounted] = useState(false)

    // Helper to get initial locale safely
    const getInitialLocale = () => {
        if (typeof window === "undefined") return "en"

        // Try to get from cookie first
        const match = document.cookie.match(new RegExp('(^| )language=([^;]+)'))
        if (match) return match[2]

        // Fallback to localStorage
        const stored = localStorage.getItem("language")
        if (stored) return stored

        return "en"
    }

    useEffect(() => {
        setMounted(true)
        setLanguage(getInitialLocale())
    }, [])

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLocale = e.target.value
        setLanguage(newLocale)

        // Set cookie
        document.cookie = `language=${newLocale}; path=/; max-age=31536000` // 1 year
        localStorage.setItem("language", newLocale)

        // Reload to apply changes
        window.location.reload()
    }

    // Prevent hydration mismatch
    if (!mounted) {
        return (
            <div className="relative w-9 h-9 flex items-center justify-center">
                <Globe className="h-4 w-4 text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="relative group">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Globe className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <select
                value={language}
                onChange={handleLanguageChange}
                className="
                    appearance-none 
                    w-9 h-9 
                    bg-transparent 
                    text-transparent 
                    cursor-pointer 
                    focus:outline-none 
                    focus:ring-2 
                    focus:ring-primary/20 
                    rounded-xl 
                    hover:bg-primary/10 
                    transition-all 
                    duration-300
                    z-10
                    relative
                "
                aria-label="Select Language"
            >
                <option value="en" className="text-foreground bg-background">English</option>
                <option value="fr" className="text-foreground bg-background">Français</option>
                <option value="ar" className="text-foreground bg-background">العربية</option>
            </select>
        </div>
    )
}
