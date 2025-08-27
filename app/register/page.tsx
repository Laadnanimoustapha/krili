import { Header } from "@/components/header"
import { RegisterForm } from "@/components/register-form"
import { Footer } from "@/components/footer"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-16">
        <RegisterForm />
      </main>
      <Footer />
    </div>
  )
}
