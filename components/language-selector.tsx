"use client"

import { Globe, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/contexts/language-context"
import type { Language } from "@/lib/translations"

const languages = [
  { code: "en" as Language, name: "English", flag: "🇬🇧" },
  { code: "fr" as Language, name: "Français", flag: "🇫🇷" },
  { code: "ar" as Language, name: "العربية", flag: "🇲🇦" },
]

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  console.log("LanguageSelector rendered, current language:", language)

  const currentLang = languages.find((lang) => lang.code === language)

  console.log("Current language object:", currentLang)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-xl"
        >
          <Globe className="h-4 w-4" />
          <span className="ml-2 text-sm font-medium">{currentLang?.flag}</span>
          <span className="sr-only">Select language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end" className="w-48 z-[60]">
        {console.log("Rendering dropdown content, languages:", languages)}
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => {
              console.log("Clicked language:", lang.code)
              setLanguage(lang.code)
            }}
            className="flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.name}</span>
            </span>
            {language === lang.code && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
