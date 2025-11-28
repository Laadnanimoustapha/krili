"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Languages } from "lucide-react"

export function LanguageSwitcher() {
    const handleLanguageChange = (lang: string) => {
        console.log(`Switched to ${lang}`)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20 rounded-xl group"
                >
                    <Languages className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                    <span className="sr-only">Switch Language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleLanguageChange("Arabic")}>
                    Arabic
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange("French")}>
                    French
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange("English")}>
                    English
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
