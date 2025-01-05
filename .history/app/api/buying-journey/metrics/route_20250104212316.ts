import { NextResponse } from "next/server"
import { Metrics } from "@/app/dashboard/buying-journey/types"

function generateMetrics(): Metrics {
  return {
    companyMentioned: Math.floor(Math.random() * 1000) + 100,
    averagePosition: Number((Math.random() * 3 + 2).toFixed(1)),
    featureScore: Number((Math.random() * 0.3 + 0.6).toFixed(2)),
    averageSentiment: Number((Math.random() * 0.3 + 0.6).toFixed(2)),
    changeFromPrevious: {
      companyMentioned: Number((Math.random() * 40 - 20).toFixed(1)),
      averagePosition: Number((Math.random() * 6 - 3).toFixed(1)),
      featureScore: Number((Math.random() * 30 - 15).toFixed(1)),
      averageSentiment: Number((Math.random() * 20 - 10).toFixed(1)),
    },
  }
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
    const metrics = generateMetrics()

    return NextResponse.json(metrics)
  } catch (error) {
    console.error("Error fetching metrics:", error)
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    )
  }
} 