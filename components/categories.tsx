import { Card, CardContent } from "@/components/ui/card"
import { Wrench, Camera, Car, Music, Gamepad2, Bike, Laptop, Home } from "lucide-react"
import Link from "next/link"

const categories = [
  { name: "Tools & Equipment", icon: Wrench, count: "2.5k+" },
  { name: "Electronics", icon: Laptop, count: "1.8k+" },
  { name: "Vehicles", icon: Car, count: "950+" },
  { name: "Photography", icon: Camera, count: "1.2k+" },
  { name: "Sports & Recreation", icon: Bike, count: "3.1k+" },
  { name: "Music & Audio", icon: Music, count: "680+" },
  { name: "Gaming", icon: Gamepad2, count: "420+" },
  { name: "Home & Garden", icon: Home, count: "2.9k+" },
]

export function Categories() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-balance">Browse by Category</h2>
          <p className="mt-4 text-muted-foreground text-pretty">
            Discover thousands of items available for rent in your area
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link key={category.name} href={`/search?category=${category.name.toLowerCase()}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <category.icon className="h-8 w-8 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
                  <p className="text-xs text-muted-foreground">{category.count} items</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
