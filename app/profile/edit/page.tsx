import { Header } from "@/components/header"
import { EditProfile } from "@/components/edit-profile"
import { Footer } from "@/components/footer"

export default function EditProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <EditProfile />
      </main>
      <Footer />
    </div>
  )
}
