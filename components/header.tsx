import { auth } from "@/auth"
import { NavbarClient } from "@/components/navbar-client"

export async function Header({ dictionary }: { dictionary?: Record<string, string> }) {
  const session = await auth()
  return <NavbarClient user={session?.user} dictionary={dictionary} />
}
