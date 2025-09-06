import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, MessageCircle, Calendar, Star } from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12">
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">How Krili Works</h1>
            <p className="text-muted-foreground text-lg">Rent anything, anytime in just a few simple steps</p>
          </div>

          {/* For Renters */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-center">For Renters</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Search className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>1. Search & Browse</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Find the perfect item using our search filters or browse by category.</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <MessageCircle className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>2. Connect</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Message the owner to ask questions and arrange pickup details.</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>3. Book & Pay</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Select your dates, pay securely, and get ready to enjoy your rental.</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Star className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>4. Enjoy & Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Use the item and leave a review to help the community.</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* For Owners */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-center">For Item Owners</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">📷</span>
                  </div>
                  <CardTitle>1. List Your Item</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Take photos, write a description, and set your rental price.</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                    <MessageCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle>2. Get Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Receive rental requests and communicate with potential renters.</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">🤝</span>
                  </div>
                  <CardTitle>3. Meet & Handover</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Meet the renter in a safe location and hand over your item.</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">💰</span>
                  </div>
                  <CardTitle>4. Get Paid</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Receive payment automatically after successful item return.</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center space-y-6 bg-muted/50 rounded-lg p-8">
            <h2 className="text-2xl font-bold">Ready to get started?</h2>
            <p className="text-muted-foreground">Join thousands of users already renting and earning on Krili</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="/browse">Start Renting</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="/list-item">List an Item</a>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
