import { Header } from "@/components/header"
import { UserProfile } from "@/components/user-profile"
import { Footer } from "@/components/footer"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { RowDataPacket } from "mysql2"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Query the database for the user
  const [rows] = await db.query<RowDataPacket[]>(
    'SELECT id, email, first_name, last_name, phone, created_at FROM users WHERE email = ?',
    [session.user.email]
  );

  const user = rows[0] || null;

  // Transform the user data to match the expected interface if necessary
  // The DB returns created_at as a Date object usually, which matches the interface

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <UserProfile user={user as any} />
      </main>
      <Footer />
    </div>
  )
}
