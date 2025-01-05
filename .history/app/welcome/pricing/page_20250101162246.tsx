import { PricingCards } from "@/components/pages/pricing/pricing-cards"
import { createClient } from "@/app/supabase/server"
import { redirect } from "next/navigation"
import { StyledText } from "@/components/ui/styled-text"

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect("/protected")
  }

  return (
    <main className="relative overflow-hidden bg-background">
      {/* Purple gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#28015d]/20 via-background to-background" />
      
      <section className="relative container space-y-6 py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h1 className="font-atkinson bg-gradient-to-r from-[#28015d] via-[#4a0f8b] to-[#6a1cb6] bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
            <StyledText text="Simple, usage-based pricing" />
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            <StyledText text="Start for free, upgrade as you grow. Choose the plan that best suits your needs. No hidden fees or surprises." />
          </p>
        </div>
        <PricingCards />
      </section>
    </main>
  )
} 