"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"
import { useDictionary } from "@/components/app-wrapper"

export function LanguageSwitcher() {
    const { locale } = useDictionary()

    const switchLanguage = (newLocale: string) => {
        document.cookie = `language=${newLocale}; path=/; max-age=31536000` // 1 year
        window.location.reload()
    }

    const getLanguageName = (code: string) => {
        switch (code) {
            case "en":
                return "English"
            case "fr":
                return "Français"
            case "ar":
                return "العربية"
            default:
                return code.toUpperCase()
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 px-0 rounded-xl">
                    <Globe className="h-4 w-4" />
                    <span className="sr-only">Switch Language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => switchLanguage("en")} className={locale === "en" ? "bg-accent" : ""}>
                    English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => switchLanguage("fr")} className={locale === "fr" ? "bg-accent" : ""}>
                    Français
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => switchLanguage("ar")} className={locale === "ar" ? "bg-accent" : ""}>
                    العربية
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
