import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Suspense } from "react"
import { FloatingActionButton } from "@/components/floating-action-button"
import { QuickSearch } from "@/components/quick-search"
import { ToastProvider, ToastViewport } from "@/components/ui/toast"
import { NotificationProvider } from "@/components/notification-context"

export const metadata: Metadata = {
  title: "Krili - Rent Anything, Anytime",
  description:
    "The ultimate peer-to-peer rental marketplace. Rent or list anything from tools to electronics, vehicles to equipment.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <NotificationProvider>
            <ToastProvider>
              <Suspense fallback={null}>
                {children}
                <FloatingActionButton />
                <QuickSearch />
              </Suspense>
              <ToastViewport />
            </ToastProvider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
