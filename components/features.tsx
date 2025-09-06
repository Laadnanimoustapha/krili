import { Card, CardContent } from "@/components/ui/card"
import { Shield, CreditCard, MessageCircle, Star, Clock, MapPin } from "lucide-react"
import { ScrollReveal } from "@/components/scroll-reveal"
import { AnimatedCounter } from "@/components/animated-counter"

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
        <ScrollReveal direction="up" className="text-center mb-12">
          <h2 className="text-3xl font-bold text-balance">Why Choose Krili?</h2>
          <p className="mt-4 text-muted-foreground text-pretty max-w-2xl mx-auto">
            We've built the most trusted and user-friendly rental marketplace with features designed for both renters
            and owners.
          </p>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={200} className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">
                <AnimatedCounter end={50000} suffix="+" />
              </div>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">
                <AnimatedCounter end={15000} suffix="+" />
              </div>
              <p className="text-sm text-muted-foreground">Items Listed</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">
                <AnimatedCounter end={98} suffix="%" />
              </div>
              <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">
                <AnimatedCounter end={25} suffix="+" />
              </div>
              <p className="text-sm text-muted-foreground">Cities</p>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <ScrollReveal key={feature.title} direction="up" delay={index * 100} className="group">
              <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="relative overflow-hidden">
                    <feature.icon className="h-10 w-10 text-primary mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
