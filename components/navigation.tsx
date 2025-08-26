"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Search,
  Menu,
  Bell,
  MessageCircle,
  User,
  Heart,
  Settings,
  LogOut,
  Sun,
  Moon,
  Plus,
  Home,
  Grid3X3,
  UserCircle,
} from "lucide-react"

export function Navigation() {
  const [isDark, setIsDark] = useState(false)
  const [notifications, setNotifications] = useState(3)
  const [messages, setMessages] = useState(2)
  const pathname = usePathname()

  useEffect(() => {
    const theme = localStorage.getItem("theme")
    if (theme === "dark") {
      setIsDark(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleTheme = () => {
    setIsDark(!isDark)
    if (!isDark) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/search", label: "Browse", icon: Grid3X3 },
    { href: "/chat", label: "Messages", icon: MessageCircle, badge: messages },
    { href: "/profile", label: "Profile", icon: UserCircle },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/kriliblack-logo.png" alt="Krili" width={120} height={40} className="dark:hidden" />
          <Image src="/white-logo.png" alt="Krili" width={120} height={40} className="hidden dark:block" />
        </Link>

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search for items to rent..." className="pl-10 pr-4" />
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Add Item Button */}
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/add-item">
              <Plus className="h-4 w-4 mr-2" />
              List Item
            </Link>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/notifications">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500">
                  {notifications}
                </Badge>
              )}
            </Link>
          </Button>

          {/* Messages */}
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/chat">
              <MessageCircle className="h-5 w-5" />
              {messages > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-primary">
                  {messages}
                </Badge>
              )}
            </Link>
          </Button>

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Image src="/defult-profile.jpeg" alt="Profile" width={32} height={32} className="rounded-full" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/wishlist">
                  <Heart className="mr-2 h-4 w-4" />
                  Wishlist
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/rentals">
                  <Grid3X3 className="mr-2 h-4 w-4" />
                  My Rentals
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/login" className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center space-x-2">
          {/* Mobile Search */}
          <Button variant="ghost" size="icon" asChild>
            <Link href="/search">
              <Search className="h-5 w-5" />
            </Link>
          </Button>

          {/* Mobile Menu Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-4 mt-8">
                {/* User Profile */}
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <Image src="/defult-profile.jpeg" alt="Profile" width={40} height={40} className="rounded-full" />
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-sm text-muted-foreground">john@example.com</p>
                  </div>
                </div>

                {/* Navigation Items */}
                <div className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                          isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                        {item.badge && item.badge > 0 && <Badge className="ml-auto bg-primary">{item.badge}</Badge>}
                      </Link>
                    )
                  })}
                </div>

                {/* Mobile Actions */}
                <div className="space-y-2 pt-4 border-t">
                  <Button className="w-full justify-start bg-primary hover:bg-primary/90" asChild>
                    <Link href="/add-item">
                      <Plus className="h-4 w-4 mr-2" />
                      List Item
                    </Link>
                  </Button>

                  <Button variant="outline" className="w-full justify-start bg-transparent" onClick={toggleTheme}>
                    {isDark ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                    {isDark ? "Light Mode" : "Dark Mode"}
                  </Button>

                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <Link href="/settings">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </Button>

                  <Button variant="outline" className="w-full justify-start text-red-600 bg-transparent" asChild>
                    <Link href="/login">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
