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
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-b shadow-lg"
          : "bg-background/80 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="relative overflow-hidden rounded-lg">
            <Image
              src="https://laadnanimoustapha.github.io/krili/public/Assests/logo.ico"
              alt="Krili Logo"
              width={32}
              height={32}
              className="rounded transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <span className="text-xl font-bold text-primary transition-colors duration-300 group-hover:text-primary/80">
            Krili
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          <Link
            href="/browse"
            className="px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 hover:bg-primary/10 hover:text-primary relative group"
          >
            Browse
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link
            href="/list-item"
            className="px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 hover:bg-primary/10 hover:text-primary relative group"
          >
            <Plus className="h-4 w-4 inline mr-1" />
            List Item
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link
            href="/my-listings"
            className="px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 hover:bg-primary/10 hover:text-primary relative group"
          >
            My Listings
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link
            href="/billing"
            className="px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 hover:bg-primary/10 hover:text-primary relative group"
          >
            <Wallet className="h-4 w-4 inline mr-1" />
            Billing
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </nav>

        <div className="hidden md:flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="relative hover:bg-primary/10 transition-all duration-200"
            asChild
          >
            <Link href="/search">
              <Search className="h-4 w-4" />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="relative hover:bg-primary/10 transition-all duration-200"
            asChild
          >
            <Link href="/wishlist">
              <Heart className="h-4 w-4" />
              {wishlistCount > 0 && (
                <Badge variant="secondary" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs animate-pulse">
                  {wishlistCount}
                </Badge>
              )}
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="relative hover:bg-primary/10 transition-all duration-200"
            asChild
          >
            <Link href="/messages">
              <MessageCircle className="h-4 w-4" />
              {messageCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs animate-pulse">
                  {messageCount}
                </Badge>
              )}
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="relative hover:bg-primary/10 transition-all duration-200"
            asChild
          >
            <Link href="/notifications">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs animate-pulse">
                  {unreadCount}
                </Badge>
              )}
            </Link>
          </Button>

          <Button variant="ghost" size="sm" className="hover:bg-primary/10 transition-all duration-200" asChild>
            <Link href="/profile">
              <User className="h-4 w-4" />
            </Link>
          </Button>

          <div className="h-6 w-px bg-border mx-2"></div>

          <ModeToggle />

          <Button
            variant="outline"
            size="sm"
            className="hover:bg-primary/10 transition-all duration-200 bg-transparent"
            asChild
          >
            <Link href="/login">Login</Link>
          </Button>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg"
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
            className="transition-transform duration-200 hover:scale-105"
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur-md animate-in slide-in-from-top-2 duration-300">
          <div className="container py-4 space-y-2">
            <div className="space-y-1">
              <Link
                href="/browse"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-primary/10 hover:text-primary transition-all duration-200"
              >
                Browse
              </Link>
              <Link
                href="/list-item"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-primary/10 hover:text-primary transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                List Item
              </Link>
              <Link
                href="/my-listings"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-primary/10 hover:text-primary transition-all duration-200"
              >
                My Listings
              </Link>
              <Link
                href="/billing"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-primary/10 hover:text-primary transition-all duration-200"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Billing
              </Link>
            </div>

            <div className="border-t pt-2 space-y-1">
              <Link
                href="/wishlist"
                className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md hover:bg-primary/10 hover:text-primary transition-all duration-200"
              >
                <span className="flex items-center">
                  <Heart className="h-4 w-4 mr-2" />
                  Wishlist
                </span>
                {wishlistCount > 0 && (
                  <Badge variant="secondary" className="text-xs animate-pulse">
                    {wishlistCount}
                  </Badge>
                )}
              </Link>
              <Link
                href="/messages"
                className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md hover:bg-primary/10 hover:text-primary transition-all duration-200"
              >
                <span className="flex items-center">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Messages
                </span>
                {messageCount > 0 && (
                  <Badge variant="destructive" className="text-xs animate-pulse">
                    {messageCount}
                  </Badge>
                )}
              </Link>
              <Link
                href="/notifications"
                className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md hover:bg-primary/10 hover:text-primary transition-all duration-200"
              >
                <span className="flex items-center">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs animate-pulse">
                    {unreadCount}
                  </Badge>
                )}
              </Link>
              <Link
                href="/profile"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-primary/10 hover:text-primary transition-all duration-200"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </div>

            <div className="flex space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 hover:bg-primary/10 transition-all duration-200 bg-transparent"
                asChild
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90 transition-all duration-200" asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
