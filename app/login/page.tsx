import { Header } from "@/components/header"
import { LoginForm } from "@/components/login-form"
import { Footer } from "@/components/footer"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-16">
        <LoginForm />
      </main>
      <Footer />
    </div>
  )
}
