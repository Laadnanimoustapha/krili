import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Community Guidelines</h1>
            <p className="text-muted-foreground text-lg">Building a safe and respectful community</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Be Respectful</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
              <p>
                Treat all community members with respect and kindness. Harassment, discrimination, or abusive behavior
                will not be tolerated.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Honest Listings</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
              <p>
                Provide accurate descriptions and photos of your items. Misrepresenting items or their condition is not
                allowed.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Safe Transactions</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
              <p>
                Always meet in safe, public locations for item exchanges. Use our secure payment system for all
                transactions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Care for Items</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
              <p>Treat borrowed items with care and return them in the same condition you received them.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Report Issues</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
              <p>
                If you encounter any problems or violations of these guidelines, please report them to our support team
                immediately.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
