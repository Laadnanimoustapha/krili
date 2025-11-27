"use client"

import { usePathname } from "next/navigation"

interface AppWrapperProps {
    children: React.ReactNode
    header?: React.ReactNode
    footer?: React.ReactNode
}

export function AppWrapper({ children, header, footer }: AppWrapperProps) {
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
