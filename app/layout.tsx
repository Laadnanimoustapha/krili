import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Suspense } from "react"
import { FloatingActionButton } from "@/components/floating-action-button"
import { QuickSearch } from "@/components/quick-search"
import { ToastProvider, ToastViewport } from "@/components/ui/toast"
import { NotificationProvider } from "@/components/notification-context"
import { PageTransition } from "@/components/page-transition"
import { LanguageProvider } from "@/contexts/language-context"
import { SessionProvider } from "next-auth/react"
import { auth } from "@/auth"
import { AppWrapper } from "@/components/app-wrapper"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: {
    default: "Krili - Rent Anything, Anytime",
    template: "%s | Krili",
  },
  description:
    "The ultimate peer-to-peer rental marketplace. Rent or list anything from tools to electronics, vehicles to equipment. Join thousands of users sharing resources in your community.",
  keywords: [
    "rental marketplace",
    "peer-to-peer rental",
    "rent tools",
    "rent electronics",
    "equipment rental",
    "sharing economy",
    "rent anything",
    "local rentals",
    "community sharing",
  ],
  authors: [{ name: "Krili Team" }],
  creator: "Krili",
  publisher: "Krili",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://krili.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://krili.com",
    title: "Krili - Rent Anything, Anytime",
    description:
      "The ultimate peer-to-peer rental marketplace. Rent or list anything from tools to electronics, vehicles to equipment.",
    siteName: "Krili",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Krili - Peer-to-Peer Rental Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Krili - Rent Anything, Anytime",
    description:
      "The ultimate peer-to-peer rental marketplace. Rent or list anything from tools to electronics, vehicles to equipment.",
    images: ["/twitter-image.jpg"],
    creator: "@krili_app",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  category: "marketplace",
  generator: "v0.app",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#6366f1" },
    { media: "(prefers-color-scheme: dark)", color: "#6366f1" },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.ico" sizes="any" />
        <link rel="icon" href="/icon-192x192.png" type="image/png" />
        <link rel="icon-192x192" href="/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="Krili" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Krili" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#6366f1" />
        <meta name="theme-color" content="#6366f1" />

        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS prefetch for better performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />

        {/* Structured data for organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Krili",
              url: "https://krili.comicon-192x192",
              logo: "https://krili.com/icon-192x192.png",
              description: "The ultimate peer-to-peer rental marketplace",
              sameAs: [
                "https://twitter.com/krili_app",
                "https://facebook.com/krili",
                "https://instagram.com/krili_app",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+1-555-KRILI",
                contactType: "customer service",
              },
            }),
          }}
        />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <SessionProvider session={session}>
            <LanguageProvider>
              <NotificationProvider>
                <ToastProvider>
                  <PageTransition>
                    <Suspense fallback={null}>
                      <AppWrapper header={<Header />} footer={<Footer />}>
                        {children}
                      </AppWrapper>
                      <FloatingActionButton />
                      <QuickSearch />
                    </Suspense>
                  </PageTransition>
                  <ToastViewport />
                </ToastProvider>
              </NotificationProvider>
            </LanguageProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
