import { Header } from "@/components/header"
import { UserProfile } from "@/components/user-profile"
import { Footer } from "@/components/footer"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <UserProfile />
      </main>
      <Footer />
    </div>
  )
}
