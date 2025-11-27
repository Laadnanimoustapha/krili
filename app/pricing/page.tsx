import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle } from "lucide-react"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12">
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Simple, Transparent Pricing</h1>
            <p className="text-muted-foreground text-lg">No hidden fees, just fair pricing for everyone</p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="relative">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">For Renters</CardTitle>
                <p className="text-muted-foreground">Rent items from the community</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold">Free</div>
                  <p className="text-muted-foreground">to browse and rent</p>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Browse unlimited items</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Secure payment processing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Insurance protection included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>24/7 customer support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Review system</span>
                  </li>
                </ul>

                <Button className="w-full" size="lg">
                  Start Renting
                </Button>
              </CardContent>
            </Card>

            <Card className="relative border-primary">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">Popular</Badge>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">For Item Owners</CardTitle>
                <p className="text-muted-foreground">Earn money from your items</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold">15%</div>
                  <p className="text-muted-foreground">service fee per rental</p>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>List unlimited items</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Automatic payment processing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Full insurance coverage</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Marketing and promotion</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Analytics dashboard</span>
                  </li>
                </ul>

                <Button className="w-full" size="lg">
                  Start Earning
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Additional Info */}
          <div className="max-w-4xl mx-auto space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>How Pricing Works</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
                <ul>
                  <li>
                    <strong>For Renters:</strong> You pay the rental price set by the item owner plus any applicable
                    taxes. No additional fees from Krili.
                  </li>
                  <li>
                    <strong>For Owners:</strong> You keep 85% of each rental payment. Krili takes a 15% service fee to
                    cover payment processing, insurance, and platform maintenance.
                  </li>
                  <li>
                    <strong>Payment Processing:</strong> All payments are processed securely through our platform with
                    industry-standard encryption.
                  </li>
                  <li>
                    <strong>Insurance:</strong> Comprehensive coverage is included at no extra cost to protect both
                    renters and owners.
                  </li>
                </ul>
              </CardContent>
            </Card>

            <div className="text-center space-y-4 bg-muted/50 rounded-lg p-8">
              <h2 className="text-2xl font-bold">Questions about pricing?</h2>
              <p className="text-muted-foreground">Our support team is here to help</p>
              <Button variant="outline" size="lg">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
