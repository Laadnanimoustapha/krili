"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Laptop,
  Car,
  Wrench,
  Mountain,
  Blend as Blender,
  GlassWater,
  Search,
  Plus,
  Star,
  MapPin,
  Sun,
  Moon,
  ArrowUp,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react"
import Image from "next/image"

export default function HomePage() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [notification, setNotification] = useState<{ message: string; type: string } | null>(null)
  const [statsAnimated, setStatsAnimated] = useState(false)

  // Theme toggle functionality
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    document.body.setAttribute("data-theme", newTheme)
    showNotification(`Switched to ${newTheme} theme`, "success")
  }

  // Notification system
  const showNotification = (message: string, type = "info", duration = 3000) => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), duration)
  }

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Initialize theme and welcome message
  useEffect(() => {
    document.body.setAttribute("data-theme", theme)
    setTimeout(() => {
      showNotification("Welcome to KRILI! 🎉", "success", 4000)
    }, 1500)
  }, [])

  // Newsletter form submission
  const handleNewsletterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email")
    showNotification("Thanks for subscribing to our newsletter!", "success")
    e.currentTarget.reset()
  }

  const categories = [
    {
      id: "electronics",
      icon: Laptop,
      title: "Electronics",
      desc: "Latest gadgets, laptops, cameras, and tech equipment for all your digital needs",
    },
    {
      id: "vehicles",
      icon: Car,
      title: "Vehicles",
      desc: "Cars, bikes, scooters, and more for convenient transportation solutions",
    },
    {
      id: "tools",
      icon: Wrench,
      title: "Tools & Equipment",
      desc: "Professional tools and equipment for construction, gardening, and DIY projects",
    },
    {
      id: "outdoor",
      icon: Mountain,
      title: "Outdoor Gear",
      desc: "Camping equipment, sports gear, and adventure essentials for outdoor enthusiasts",
    },
    {
      id: "appliances",
      icon: Blender,
      title: "Appliances",
      desc: "Home appliances, kitchen equipment, and household items for temporary needs",
    },
    {
      id: "party",
      icon: GlassWater,
      title: "Party & Events",
      desc: "Everything you need for parties, weddings, and special events",
    },
  ]

  const featuredItems = [
    {
      title: "Professional Camera Kit",
      price: "$25/day",
      location: "Casablanca",
      image:
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
    {
      title: "Mountain Bike",
      price: "$15/day",
      location: "Marrakech",
      image:
        "https://images.unsplash.com/photo-1485965120184-e220f721d03e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
    {
      title: "Bluetooth Speaker",
      price: "$8/day",
      location: "Rabat",
      image:
        "https://images.unsplash.com/photo-1608043152269-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
  ]

  const testimonials = [
    {
      text: "KRILI made it so easy to rent a camera for my vacation. The process was smooth, and the owner was very helpful. Saved me hundreds of dollars!",
      author: "Youssef Amrani",
      location: "Casablanca",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
    },
    {
      text: "I needed a specific power tool for a home renovation project. Instead of buying it, I rented it on KRILI for a fraction of the cost. Highly recommended!",
      author: "Fatima Zahra",
      location: "Marrakech",
      avatar:
        "https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
    },
    {
      text: "As a student, I can't afford to buy expensive equipment for my projects. KRILI has been a lifesaver for renting what I need at affordable prices.",
      author: "Amine El Fassi",
      location: "Rabat",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.ico" alt="KRILI Logo" width={32} height={32} />
            <span className="font-bold text-xl">KRILI</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-primary font-medium">
              Home
            </Link>
            <Link href="/search" className="hover:text-primary transition-colors">
              Search
            </Link>
            <Link href="/profile" className="hover:text-primary transition-colors">
              Profile
            </Link>
            <Link href="/login" className="hover:text-primary transition-colors">
              Logout
            </Link>
          </nav>

          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <Badge variant="secondary" className="w-fit">
              <Star className="h-4 w-4 mr-2" />
              Most Trusted Rental Platform
            </Badge>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">Rent Anything, Anytime</h1>

            <p className="text-xl text-muted-foreground leading-relaxed">
              Discover thousands of items available for rent in your area. From electronics to vehicles, find what you
              need when you need it.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="text-lg px-8">
                <Link href="/search">
                  <Search className="h-5 w-5 mr-2" />
                  Explore Items
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent" asChild>
                <Link href="/add-item">
                  <Plus className="h-5 w-5 mr-2" />
                  List Item
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">10,000+</div>
                <div className="text-sm text-muted-foreground">Items Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">5,000+</div>
                <div className="text-sm text-muted-foreground">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">20+</div>
                <div className="text-sm text-muted-foreground">Moroccan Cities</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <Image
              src="https://images.unsplash.com/photo-1535223289827-42f1e9919769?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
              alt="Rental Items"
              width={600}
              height={400}
              className="rounded-2xl shadow-2xl"
            />
          </div>
        </section>

        {/* Categories Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Popular Categories</h2>
            <p className="text-xl text-muted-foreground">
              Browse our most popular rental categories and find exactly what you're looking for
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => {
              const IconComponent = category.icon
              return (
                <Card
                  key={category.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-2"
                  onClick={() => (window.location.href = `/search?category=${category.id}`)}
                >
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">{category.title}</h3>
                    <p className="text-muted-foreground">{category.desc}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-muted/50 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-xl text-muted-foreground">
                Renting items has never been easier with our simple three-step process
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  number: "1",
                  title: "Browse & Select",
                  desc: "Explore thousands of items available for rent in your area and choose what you need.",
                },
                {
                  number: "2",
                  title: "Book & Pay",
                  desc: "Select your rental dates and make a secure payment through our platform.",
                },
                {
                  number: "3",
                  title: "Enjoy & Return",
                  desc: "Use the item for your desired period and return it when you're done.",
                },
              ].map((step) => (
                <div key={step.number} className="text-center">
                  <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                  <p className="text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Items Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Featured Items</h2>
            <p className="text-xl text-muted-foreground">Check out these popular items available for rent near you</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredItems.map((item, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <div className="text-2xl font-bold text-primary mb-2">{item.price}</div>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{item.location}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="bg-muted/50 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">What Our Customers Say</h2>
              <p className="text-xl text-muted-foreground">Hear from people who have used our platform to rent items</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index}>
                  <CardContent className="p-8">
                    <p className="text-muted-foreground mb-6 italic">"{testimonial.text}"</p>
                    <div className="flex items-center gap-4">
                      <Image
                        src={testimonial.avatar || "/placeholder.svg"}
                        alt={testimonial.author}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      <div>
                        <h4 className="font-semibold">{testimonial.author}</h4>
                        <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="bg-primary text-primary-foreground py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">Stay Updated</h2>
            <p className="text-xl mb-8 opacity-90">
              Subscribe to our newsletter to get updates on new items, special offers, and rental tips.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
                className="bg-primary-foreground text-foreground"
              />
              <Button type="submit" variant="secondary" className="whitespace-nowrap">
                Subscribe
              </Button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image src="/logo.ico" alt="KRILI Logo" width={32} height={32} />
                <span className="font-bold text-xl">KRILI</span>
              </div>
              <p className="text-muted-foreground mb-6">
                KRILI is Morocco's leading rental platform, connecting people who need items with those who have them to
                rent.
              </p>
              <div className="flex gap-4">
                <Button variant="ghost" size="icon">
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Linkedin className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/" className="hover:text-foreground transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/search" className="hover:text-foreground transition-colors">
                    Search
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="hover:text-foreground transition-colors">
                    Profile
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-foreground transition-colors">
                    How it Works
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Categories</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/search?category=electronics" className="hover:text-foreground transition-colors">
                    Electronics
                  </Link>
                </li>
                <li>
                  <Link href="/search?category=vehicles" className="hover:text-foreground transition-colors">
                    Vehicles
                  </Link>
                </li>
                <li>
                  <Link href="/search?category=tools" className="hover:text-foreground transition-colors">
                    Tools & Equipment
                  </Link>
                </li>
                <li>
                  <Link href="/search?category=outdoor" className="hover:text-foreground transition-colors">
                    Outdoor Gear
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/help" className="hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-foreground transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 KRILI. All rights reserved. Created by LAADNANI</p>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button className="fixed bottom-8 right-8 z-50" size="icon" onClick={scrollToTop}>
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}

      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-24 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : notification.type === "info"
                ? "bg-blue-500 text-white"
                : "bg-gray-500 text-white"
          }`}
        >
          {notification.message}
        </div>
      )}
    </div>
  )
}
