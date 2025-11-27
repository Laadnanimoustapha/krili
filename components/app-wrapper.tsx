'use client';

import { usePathname } from 'next/navigation';

interface AppWrapperProps {
    children: React.ReactNode;
    header?: React.ReactNode;
    footer?: React.ReactNode;
}

export function AppWrapper({ children, header, footer }: AppWrapperProps) {
    const pathname = usePathname();

    // Logic to hide layout on auth pages
    const hideLayout = pathname === '/login' || pathname === '/register';

    return (
        <>
            {hideLayout ? null : header}
            <main>{children}</main>
            {hideLayout ? null : footer}
        </>
    );
}
