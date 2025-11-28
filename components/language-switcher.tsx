"use client";

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Languages } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

export function LanguageSwitcher() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()

    const toggleOpen = () => setIsOpen(!isOpen)

    const handleSelect = (locale: string) => {
        if (!pathname) return

        const segments = pathname.split('/')
        // segments[0] is always empty string for absolute paths
        // segments[1] is the first part (e.g. "fr", "ar", "en" or "profile")

        if (segments[1] && ['ar', 'fr', 'en'].includes(segments[1])) {
            segments[1] = locale
        } else {
            segments.splice(1, 0, locale)
        }

        const newPath = segments.join('/')
        router.push(newPath)
        setIsOpen(false)
    }

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="sm"
                onClick={toggleOpen}
                className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20 rounded-xl group"
            >
                <Languages className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <span className="sr-only">Switch Language</span>
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-background border rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="py-1 flex flex-col">
                        <button
                            onClick={() => handleSelect("ar")}
                            className="text-left px-4 py-2 text-sm hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2 w-full"
                        >
                            <span className="text-base">🇸🇦</span> Arabic
                        </button>
                        <button
                            onClick={() => handleSelect("fr")}
                            className="text-left px-4 py-2 text-sm hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2 w-full"
                        >
                            <span className="text-base">🇫🇷</span> French
                        </button>
                        <button
                            onClick={() => handleSelect("en")}
                            className="text-left px-4 py-2 text-sm hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2 w-full"
                        >
                            <span className="text-base">🇬🇧</span> English
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
