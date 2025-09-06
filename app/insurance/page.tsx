import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, CheckCircle, DollarSign } from "lucide-react"

export default function InsurancePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Insurance Protection</h1>
            <p className="text-muted-foreground text-lg">Rent with confidence knowing you're protected</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader className="text-center">
                <Shield className="h-12 w-12 mx-auto text-primary" />
                <CardTitle>Damage Protection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center">Coverage for accidental damage up to $10,000 per incident.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-primary" />
                <CardTitle>Theft Protection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center">Full replacement value coverage for stolen items.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <DollarSign className="h-12 w-12 mx-auto text-primary" />
                <CardTitle>No Deductible</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center">Zero deductible on all covered claims.</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
              <ol>
                <li>Insurance is automatically included with every rental</li>
                <li>Report any damage or theft within 24 hours</li>
                <li>Our claims team will review and process your claim</li>
                <li>Receive compensation or replacement quickly</li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What's Covered</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
              <ul>
                <li>Accidental damage during rental period</li>
                <li>Theft of rented items</li>
                <li>Loss due to covered natural disasters</li>
                <li>Third-party liability protection</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
