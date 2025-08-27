import { Card, CardContent } from "@/components/ui/card"
import { Shield, CreditCard, MessageCircle, Star, Clock, MapPin } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Secure & Trusted",
    description: "All users are verified with KYC. Every rental is protected with comprehensive insurance coverage.",
  },
  {
    icon: CreditCard,
    title: "Easy Payments",
    description: "Secure payment processing with instant payouts. Multiple payment methods supported.",
  },
  {
    icon: MessageCircle,
    title: "Built-in Chat",
    description: "Communicate directly with renters and owners through our integrated messaging system.",
  },
  {
    icon: Star,
    title: "Rating System",
    description: "Build trust through our comprehensive rating and review system for all users.",
  },
  {
    icon: Clock,
    title: "Flexible Rentals",
    description: "Rent for hours, days, or weeks. Set your own availability and pricing.",
  },
  {
    icon: MapPin,
    title: "Local & Convenient",
    description: "Find items near you with our location-based search and pickup options.",
  },
]

export function Features() {
  return (
    <section className="py-16">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-balance">Why Choose Krili?</h2>
          <p className="mt-4 text-muted-foreground text-pretty max-w-2xl mx-auto">
            We've built the most trusted and user-friendly rental marketplace with features designed for both renters
            and owners.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <feature.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
