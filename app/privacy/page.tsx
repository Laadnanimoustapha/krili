import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
            <p className="text-muted-foreground text-lg">Last updated: January 2024</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
              <p>
                We collect information you provide directly to us, such as when you create an account, list an item, or
                contact us for support.
              </p>
              <ul>
                <li>Personal information (name, email, phone number)</li>
                <li>Profile information and photos</li>
                <li>Payment and billing information</li>
                <li>Communications with other users</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send you technical notices and support messages</li>
                <li>Communicate with you about products, services, and events</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Information Sharing</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
              <p>
                We do not sell, trade, or otherwise transfer your personal information to third parties without your
                consent, except as described in this policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Security</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
              <p>
                We implement appropriate security measures to protect your personal information against unauthorized
                access, alteration, disclosure, or destruction.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
