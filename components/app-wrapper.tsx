"use client"

import { usePathname } from "next/navigation"

import { createContext, useContext } from "react"

interface DictionaryContextType {
    dictionary: Record<string, string>
    locale: string
}

const DictionaryContext = createContext<DictionaryContextType>({
    dictionary: {},
    locale: "en",
})

export function useDictionary() {
    return useContext(DictionaryContext)
}

interface AppWrapperProps {
    children: React.ReactNode
    header?: React.ReactNode
    footer?: React.ReactNode
    dictionary?: Record<string, string>
    locale?: string
}

export function AppWrapper({ children, header, footer, dictionary = {}, locale = "en" }: AppWrapperProps) {
    const pathname = usePathname()
    const hideNavAndFooter = pathname === "/login" || pathname === "/register"

    return (
        <DictionaryContext.Provider value={{ dictionary, locale }}>
            {!hideNavAndFooter && header}
            <main>{children}</main>
            {!hideNavAndFooter && footer}
        </DictionaryContext.Provider>
    )
}
