import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MessageCircle, Book, Shield, CreditCard } from "lucide-react"

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Help Center</h1>
            <p className="text-muted-foreground text-lg">Find answers to your questions</p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search for help articles..." className="pl-10 h-12 text-lg" />
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2">Search</Button>
            </div>
          </div>

          {/* Quick Help Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Book className="h-8 w-8 mx-auto text-primary" />
                <CardTitle className="text-lg">Getting Started</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">Learn the basics of using Krili</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <CreditCard className="h-8 w-8 mx-auto text-primary" />
                <CardTitle className="text-lg">Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">Payment methods and billing</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Shield className="h-8 w-8 mx-auto text-primary" />
                <CardTitle className="text-lg">Safety</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">Stay safe while renting</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <MessageCircle className="h-8 w-8 mx-auto text-primary" />
                <CardTitle className="text-lg">Contact Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">Get help from our team</p>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-center">Frequently Asked Questions</h2>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How do I list an item for rent?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Click the "List Item" button in the navigation, fill out the item details, upload photos, and set
                    your rental price and availability.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How do payments work?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    All payments are processed securely through our platform. Renters pay upfront, and owners receive
                    payment after successful item return.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What if an item gets damaged?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    We offer protection for both renters and owners. Report any damage immediately, and our support team
                    will help resolve the issue.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How do I cancel a rental?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    You can cancel a rental up to 24 hours before the start time for a full refund. Check our
                    cancellation policy for more details.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
