import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Buying Journey Dashboard",
  description: "Analyze your company's performance across different segments and stages.",
}

export default async function BuyingJourneyPage() {
  return (
    <div className="flex flex-col gap-8 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Buying Journey Analysis</h1>
        <p className="text-muted-foreground">
          Analyze performance across regions, verticals, personas, and queries.
        </p>
      </div>
      {/* Progress bar will go here */}
      {/* View components will be rendered here based on current stage */}
    </div>
  )
} 