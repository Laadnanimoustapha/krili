"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export function Hero() {
  const [searchValue, setSearchValue] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const popularSearches = ["Camera", "Bike", "Tools", "Party Equipment", "Car"]

  return (
    <section className="relative py-20 lg:py-32 bg-gradient-to-br from-primary/5 via-background to-secondary/5 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              New: Instant booking available
            </div>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
            Rent Anything,{" "}
            <span className="text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Anytime
            </span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-muted-foreground text-pretty max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400">
            The ultimate peer-to-peer rental marketplace. From power tools to party equipment, cameras to cars - find
            what you need or earn money from what you own.
          </p>

          <div className="mt-10 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-600">
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${isSearchFocused ? "text-primary" : "text-muted-foreground"}`}
                />
                <Input
                  placeholder="What do you want to rent?"
                  className={`pl-10 h-12 text-base transition-all duration-200 ${isSearchFocused ? "ring-2 ring-primary/20 border-primary/30" : ""}`}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />

                {isSearchFocused && searchValue.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-background border rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-xs text-muted-foreground mb-2">Popular searches:</p>
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((search) => (
                        <button
                          key={search}
                          className="px-2 py-1 text-xs bg-muted hover:bg-primary/10 hover:text-primary rounded-md transition-colors duration-200"
                          onClick={() => setSearchValue(search)}
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Button size="lg" className="h-12 px-8 group hover:scale-105 transition-transform duration-200" asChild>
                <Link href="/browse">
                  Search{" "}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-800">
            <Button
              variant="outline"
              size="lg"
              className="group hover:scale-105 transition-all duration-200 bg-transparent"
              asChild
            >
              <Link href="/register">
                Start Renting
                <div className="ml-2 w-0 group-hover:w-4 transition-all duration-200 overflow-hidden">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            </Button>
            <Button variant="ghost" size="lg" className="group hover:bg-primary/10 transition-all duration-200" asChild>
              <Link href="/list-item">
                List Your Items
                <div className="ml-2 w-0 group-hover:w-4 transition-all duration-200 overflow-hidden">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-14 duration-1000 delay-1000">
            <div className="flex items-center gap-2 group hover:text-green-600 transition-colors duration-200">
              <div className="w-2 h-2 bg-green-500 rounded-full group-hover:scale-125 transition-transform duration-200"></div>
              Verified Users
            </div>
            <div className="flex items-center gap-2 group hover:text-blue-600 transition-colors duration-200">
              <div className="w-2 h-2 bg-blue-500 rounded-full group-hover:scale-125 transition-transform duration-200"></div>
              Secure Payments
            </div>
            <div className="flex items-center gap-2 group hover:text-purple-600 transition-colors duration-200">
              <div className="w-2 h-2 bg-purple-500 rounded-full group-hover:scale-125 transition-transform duration-200"></div>
              Insurance Coverage
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
