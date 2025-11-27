"use client"

import { usePathname } from "next/navigation"

interface AppWrapperProps {
    children: React.ReactNode
    header?: React.ReactNode
    footer?: React.ReactNode
}

export function AppWrapper({ children, header, footer }: AppWrapperProps) {
    const hideLayout = pathname === "/login" || pathname === "/register"

    return (
        <>
            {!hideLayout && header}
            {children}
            {!hideLayout && footer}
        </>
    )
}
