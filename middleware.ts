import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { i18nConfig } from './i18n.config'

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // Check if the path is missing a locale
    const pathnameIsMissingLocale = i18nConfig.locales.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    )

    // Ignore static files and other assets
    if (
        pathname.startsWith('/_next') ||
        pathname.includes('.') ||
        pathname.startsWith('/api')
    ) {
        return
    }

    if (pathnameIsMissingLocale) {
        const locale = i18nConfig.defaultLocale

        // Redirect to the default locale
        return NextResponse.redirect(
            new URL(`/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url)
        )
    }
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
