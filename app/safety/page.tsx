import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users, Eye, AlertTriangle } from "lucide-react"

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Safety First</h1>
            <p className="text-muted-foreground text-lg">Your safety is our top priority</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary" />
                <CardTitle>Verified Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p>All users go through identity verification to ensure a trusted community.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary" />
                <CardTitle>Community Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Read reviews and ratings from other community members before renting.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Eye className="h-8 w-8 text-primary" />
                <CardTitle>Safe Meeting Places</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Always meet in public, well-lit locations for item exchanges.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <AlertTriangle className="h-8 w-8 text-primary" />
                <CardTitle>Report Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Quickly report any safety concerns or suspicious activity to our team.</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Safety Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
              <ul>
                <li>Meet in public places during daylight hours</li>
                <li>Bring a friend when possible</li>
                <li>Inspect items carefully before renting</li>
                <li>Use our secure messaging system</li>
                <li>Never share personal financial information</li>
                <li>Trust your instincts - if something feels wrong, don't proceed</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
