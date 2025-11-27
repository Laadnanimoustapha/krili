'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function AppWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Logic to hide layout on auth pages
    const hideLayout = pathname === '/login' || pathname === '/register';

    return (
        <>
            {hideLayout ? null : <Header />}
            <main>{children}</main>
            {hideLayout ? null : <Footer />}
        </>
    );
}
