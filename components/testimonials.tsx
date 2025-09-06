"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"
import { ScrollReveal } from "@/components/scroll-reveal"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Homeowner",
    content:
      "I needed a pressure washer for one weekend. Found one nearby for $30 instead of buying a $300 one. Perfect!",
    rating: 5,
    avatar: "SJ",
  },
  {
    name: "Mike Chen",
    role: "Photography Enthusiast",
    content:
      "Rented a professional camera lens for my wedding shoot. The owner was super helpful and the quality was amazing.",
    rating: 5,
    avatar: "MC",
  },
  {
    name: "Emma Davis",
    role: "Small Business Owner",
    content: "I list my tools on Krili when I'm not using them. It's become a nice side income stream!",
    rating: 5,
    avatar: "ED",
  },
]

export function Testimonials() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-gradient-to-r from-secondary/5 to-primary/5 rounded-full blur-2xl animate-pulse delay-1000" />
      </div>

      <div className="container relative">
        <ScrollReveal direction="up" className="text-center mb-12">
          <h2 className="text-3xl font-bold text-balance">What Our Users Say</h2>
          <p className="mt-4 text-muted-foreground text-pretty">Join thousands of satisfied renters and owners</p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <ScrollReveal key={testimonial.name} direction="up" delay={index * 150} className="group">
              <Card
                className="border-0 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer hover:scale-105 hover:-translate-y-2 bg-background/80 backdrop-blur-sm"
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <CardContent className="p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                    <Quote className="h-8 w-8 text-primary" />
                  </div>

                  <div className="relative z-10">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 fill-yellow-400 text-yellow-400 transition-all duration-300 ${
                            hoveredCard === index ? "scale-125" : ""
                          }`}
                          style={{
                            transitionDelay: hoveredCard === index ? `${i * 50}ms` : "0ms",
                          }}
                        />
                      ))}
                    </div>

                    <p className="text-muted-foreground mb-4 leading-relaxed group-hover:text-foreground transition-colors duration-300">
                      "{testimonial.content}"
                    </p>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-semibold text-sm group-hover:scale-110 transition-transform duration-300">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-semibold group-hover:text-primary transition-colors duration-300">
                          {testimonial.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
