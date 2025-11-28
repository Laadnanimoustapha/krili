"use client"

import { usePathname } from "next/navigation"

interface AppWrapperProps {
    children: React.ReactNode
    header?: React.ReactNode
    footer?: React.ReactNode
    dictionary?: Record<string, string>
}

export function AppWrapper({ children, header, footer, dictionary }: AppWrapperProps) {
    const pathname = usePathname()
    const hideNavAndFooter = pathname === "/login" || pathname === "/register"

    return (
        <>
            {!hideNavAndFooter && header}
            <main>{children}</main>
            {!hideNavAndFooter && footer}
        </>
    )
}
