"use client";

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Languages } from "lucide-react"

export function LanguageSwitcher() {
    const [isOpen, setIsOpen] = useState(false)

    const toggleOpen = () => setIsOpen(!isOpen)

    const handleSelect = (language: string) => {
        console.log(`Selected: ${language}`)
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
                            onClick={() => handleSelect("Arabic")}
                            className="text-left px-4 py-2 text-sm hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2 w-full"
                        >
                            <span className="text-base">🇸🇦</span> Arabic
                        </button>
                        <button
                            onClick={() => handleSelect("French")}
                            className="text-left px-4 py-2 text-sm hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2 w-full"
                        >
                            <span className="text-base">🇫🇷</span> French
                        </button>
                        <button
                            onClick={() => handleSelect("English")}
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
