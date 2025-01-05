import { NextResponse } from "next/server"
import { ChartData } from "@/app/dashboard/buying-journey/types"

function generateTrendData(days: number): ChartData[] {
  const data: ChartData[] = []
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    data.push({
      date: date.toISOString().split("T")[0],
      companyMentioned: Math.floor(Math.random() * 1000) + 100,
      averagePosition: Number((Math.random() * 3 + 2).toFixed(1)),
      featureScore: Number((Math.random() * 0.3 + 0.6).toFixed(2)),
      averageSentiment: Number((Math.random() * 0.3 + 0.6).toFixed(2)),
    })
  }

  return data
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const region = searchParams.get("region")
  const vertical = searchParams.get("vertical")
  const persona = searchParams.get("persona")
  const query = searchParams.get("query")
  const sortBy = searchParams.get("sortBy")
  const timeFrame = searchParams.get("timeFrame")

  try {
    // TODO: Replace with actual database query
    // This is a mock implementation
    const days = timeFrame === "month" ? 30 : 7
    const trends = generateTrendData(days)

    return NextResponse.json(trends)
  } catch (error) {
    console.error("Error fetching trends:", error)
    return NextResponse.json(
      { error: "Failed to fetch trends" },
      { status: 500 }
    )
  }
} 