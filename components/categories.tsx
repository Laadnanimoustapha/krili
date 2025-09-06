import { Card, CardContent } from "@/components/ui/card"
import { Wrench, Camera, Car, Music, Gamepad2, Bike, Laptop, Home } from "lucide-react"
import Link from "next/link"
import { ScrollReveal } from "@/components/scroll-reveal"

const categories = [
  { name: "Tools & Equipment", icon: Wrench, count: "2.5k+", color: "from-orange-500 to-red-500" },
  { name: "Electronics", icon: Laptop, count: "1.8k+", color: "from-blue-500 to-cyan-500" },
  { name: "Vehicles", icon: Car, count: "950+", color: "from-green-500 to-emerald-500" },
  { name: "Photography", icon: Camera, count: "1.2k+", color: "from-purple-500 to-pink-500" },
  { name: "Sports & Recreation", icon: Bike, count: "3.1k+", color: "from-yellow-500 to-orange-500" },
  { name: "Music & Audio", icon: Music, count: "680+", color: "from-indigo-500 to-purple-500" },
  { name: "Gaming", icon: Gamepad2, count: "420+", color: "from-pink-500 to-rose-500" },
  { name: "Home & Garden", icon: Home, count: "2.9k+", color: "from-teal-500 to-green-500" },
]

export function Categories() {
  return (
    <section className="py-16 bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-secondary/5 rounded-full blur-xl animate-pulse delay-1000" />
      </div>

      <div className="container relative">
        <ScrollReveal direction="up" className="text-center mb-12">
          <h2 className="text-3xl font-bold text-balance">Browse by Category</h2>
          <p className="mt-4 text-muted-foreground text-pretty">
            Discover thousands of items available for rent in your area
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <ScrollReveal key={category.name} direction="up" delay={index * 75} className="group">
              <Link href={`/search?category=${category.name.toLowerCase()}`}>
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group-hover:scale-105 group-hover:-translate-y-2 border-0 bg-background/80 backdrop-blur-sm">
                  <CardContent className="p-6 text-center relative overflow-hidden">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                    />

                    <div className="relative z-10">
                      <div className="relative mb-3">
                        <category.icon className="h-8 w-8 mx-auto text-primary group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" />
                        <div className="absolute inset-0 rounded-full bg-primary/20 scale-0 group-hover:scale-150 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                      </div>
                      <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors duration-300">
                        {category.name}
                      </h3>
                      <p className="text-xs text-muted-foreground group-hover:text-primary/70 transition-colors duration-300">
                        {category.count} items
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
