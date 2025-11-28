import { auth } from "@/auth"
import { NavbarClient } from "@/components/navbar-client"
import { getDictionary } from "@/dictionaries/get-dictionary"

export async function Header({ locale }: { locale: string }) {
  const session = await auth()
  const dictionary = await getDictionary(locale)
  return <NavbarClient user={session?.user} dictionary={dictionary} />
}
