import { auth } from "@/auth"
import { NavbarClient } from "@/components/navbar-client"

export async function Header() {
  const session = await auth()
  return <NavbarClient user={session?.user} />
}
