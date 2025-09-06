"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Menu, X, Search, MessageCircle, Bell, User, Heart, Wallet, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/components/notification-context"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const { unreadCount, messageCount, wishlistCount } = useNotifications()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 ease-out ${
        isScrolled
          ? "bg-background/95 backdrop-blur-xl border-b shadow-xl shadow-primary/5"
          : "bg-background/80 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="relative overflow-hidden rounded-xl p-1 transition-all duration-300 group-hover:bg-primary/10 group-hover:shadow-lg group-hover:shadow-primary/20">
            <Image
              src="https://laadnanimoustapha.github.io/krili/public/Assests/logo.ico"
              alt="Krili Logo"
              width={32}
              height={32}
              className="rounded-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent transition-all duration-300 group-hover:from-primary/90 group-hover:to-primary group-hover:scale-105">
            Krili
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          <Link
            href="/browse"
            className="px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary hover:shadow-md hover:shadow-primary/10 hover:scale-105 relative group overflow-hidden"
          >
            <span className="relative z-10">Browse</span>
            <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 group-hover:w-full group-hover:left-0 rounded-full"></span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-xl" />
          </Link>
          <Link
            href="/list-item"
            className="px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary hover:shadow-md hover:shadow-primary/10 hover:scale-105 relative group overflow-hidden"
          >
            <span className="relative z-10 flex items-center">
              <Plus className="h-4 w-4 inline mr-1 transition-transform duration-300 group-hover:rotate-90" />
              List Item
            </span>
            <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 group-hover:w-full group-hover:left-0 rounded-full"></span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-xl" />
          </Link>
          <Link
            href="/my-listings"
            className="px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary hover:shadow-md hover:shadow-primary/10 hover:scale-105 relative group overflow-hidden"
          >
            <span className="relative z-10">My Listings</span>
            <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 group-hover:w-full group-hover:left-0 rounded-full"></span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-xl" />
          </Link>
          <Link
            href="/billing"
            className="px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary hover:shadow-md hover:shadow-primary/10 hover:scale-105 relative group overflow-hidden"
          >
            <span className="relative z-10 flex items-center">
              <Wallet className="h-4 w-4 inline mr-1 transition-transform duration-300 group-hover:scale-110" />
              Billing
            </span>
            <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 group-hover:w-full group-hover:left-0 rounded-full"></span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-xl" />
          </Link>
        </nav>

        <div className="hidden md:flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="relative hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20 rounded-xl group"
            asChild
          >
            <Link href="/search">
              <Search className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
              <span className="sr-only">Search</span>
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="relative hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20 rounded-xl group"
            asChild
          >
            <Link href="/wishlist">
              <Heart className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:fill-red-500 group-hover:text-red-500" />
              {wishlistCount > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs animate-bounce bg-gradient-to-r from-red-500 to-pink-500 text-white border-0"
                >
                  {wishlistCount}
                </Badge>
              )}
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="relative hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20 rounded-xl group"
            asChild
          >
            <Link href="/messages">
              <MessageCircle className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12" />
              {messageCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs animate-pulse bg-gradient-to-r from-orange-500 to-red-500 border-0 shadow-lg"
                >
                  {messageCount}
                </Badge>
              )}
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="relative hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20 rounded-xl group"
            asChild
          >
            <Link href="/notifications">
              <Bell className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs animate-bounce bg-gradient-to-r from-red-500 to-pink-600 border-0 shadow-lg"
                >
                  {unreadCount}
                </Badge>
              )}
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20 rounded-xl group"
            asChild
          >
            <Link href="/profile">
              <User className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
            </Link>
          </Button>

          <div className="h-6 w-px bg-gradient-to-b from-transparent via-border to-transparent mx-3"></div>

          <ModeToggle />

          <Button
            variant="outline"
            size="sm"
            className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300 bg-transparent border-primary/20 hover:border-primary/40 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 rounded-xl"
            asChild
          >
            <Link href="/login">Login</Link>
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/30 hover:scale-105 rounded-xl font-medium"
            asChild
          >
            <Link href="/register">Sign Up</Link>
          </Button>
        </div>

        <div className="flex md:hidden items-center space-x-2">
          <ModeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="transition-all duration-300 hover:scale-110 hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/20 rounded-xl group"
          >
            <div className="relative w-4 h-4">
              <Menu
                className={`h-4 w-4 absolute transition-all duration-300 ${isMenuOpen ? "opacity-0 rotate-180 scale-0" : "opacity-100 rotate-0 scale-100"}`}
              />
              <X
                className={`h-4 w-4 absolute transition-all duration-300 ${isMenuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-180 scale-0"}`}
              />
            </div>
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t bg-background/98 backdrop-blur-xl animate-in slide-in-from-top-2 duration-500 shadow-xl">
          <div className="container py-6 space-y-3">
            <div className="space-y-2">
              {[
                { href: "/browse", label: "Browse", icon: null },
                { href: "/list-item", label: "List Item", icon: Plus },
                { href: "/my-listings", label: "My Listings", icon: null },
                { href: "/billing", label: "Billing", icon: Wallet },
                { href: "/search", label: "Search", icon: Search },
              ].map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center px-4 py-3 text-sm font-medium rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary transition-all duration-300 hover:scale-105 hover:shadow-md group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {item.icon && (
                    <item.icon className="h-4 w-4 mr-3 transition-transform duration-300 group-hover:scale-110" />
                  )}
                  <span className="transition-transform duration-300 group-hover:translate-x-1">{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="border-t border-gradient-to-r from-transparent via-border to-transparent pt-3 space-y-2">
              <Link
                href="/wishlist"
                className="flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary transition-all duration-300 hover:scale-105 group"
              >
                <span className="flex items-center">
                  <Heart className="h-4 w-4 mr-3 transition-all duration-300 group-hover:scale-110 group-hover:fill-red-500 group-hover:text-red-500" />
                  <span className="transition-transform duration-300 group-hover:translate-x-1">Wishlist</span>
                </span>
                {wishlistCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-xs animate-pulse bg-gradient-to-r from-red-500 to-pink-500 text-white border-0"
                  >
                    {wishlistCount}
                  </Badge>
                )}
              </Link>
              <Link
                href="/messages"
                className="flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary transition-all duration-300 hover:scale-105 group"
              >
                <span className="flex items-center">
                  <MessageCircle className="h-4 w-4 mr-3 transition-transform duration-300 group-hover:scale-110" />
                  <span className="transition-transform duration-300 group-hover:translate-x-1">Messages</span>
                </span>
                {messageCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="text-xs animate-pulse bg-gradient-to-r from-orange-500 to-red-500 border-0"
                  >
                    {messageCount}
                  </Badge>
                )}
              </Link>
              <Link
                href="/notifications"
                className="flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary transition-all duration-300 hover:scale-105 group"
              >
                <span className="flex items-center">
                  <Bell className="h-4 w-4 mr-3 transition-transform duration-300 group-hover:scale-110" />
                  <span className="transition-transform duration-300 group-hover:translate-x-1">Notifications</span>
                </span>
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="text-xs animate-bounce bg-gradient-to-r from-red-500 to-pink-600 border-0"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Link>
              <Link
                href="/profile"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary transition-all duration-300 hover:scale-105 group"
              >
                <User className="h-4 w-4 mr-3 transition-transform duration-300 group-hover:scale-110" />
                <span className="transition-transform duration-300 group-hover:translate-x-1">Profile</span>
              </Link>
            </div>

            <div className="flex space-x-3 pt-4 border-t border-gradient-to-r from-transparent via-border to-transparent">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300 bg-transparent border-primary/20 hover:border-primary/40 hover:scale-105 rounded-xl"
                asChild
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl rounded-xl"
                asChild
              >
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
