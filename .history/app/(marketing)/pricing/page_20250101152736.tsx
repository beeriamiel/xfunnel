import { PricingCards } from "@/components/pages/pricing/pricing-cards"
import { createClient } from "@/app/supabase/server"
import { redirect } from "next/navigation"

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect("/protected")
  }

  return (
    <main className="flex-1 py-24">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
        <p className="text-xl text-muted-foreground">
          Choose the plan that's right for you
        </p>
      </div>
      <PricingCards />
    </main>
  )
} 