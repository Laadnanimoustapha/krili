import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Homeowner",
    content:
      "I needed a pressure washer for one weekend. Found one nearby for $30 instead of buying a $300 one. Perfect!",
    rating: 5,
  },
  {
    name: "Mike Chen",
    role: "Photography Enthusiast",
    content:
      "Rented a professional camera lens for my wedding shoot. The owner was super helpful and the quality was amazing.",
    rating: 5,
  },
  {
    name: "Emma Davis",
    role: "Small Business Owner",
    content: "I list my tools on Krili when I'm not using them. It's become a nice side income stream!",
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section className="py-16">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-balance">What Our Users Say</h2>
          <p className="mt-4 text-muted-foreground text-pretty">Join thousands of satisfied renters and owners</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 leading-relaxed">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
