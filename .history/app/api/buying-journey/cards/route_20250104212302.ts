import { NextResponse } from "next/server"
import { Stage, SelectionCard, Phase } from "@/app/dashboard/buying-journey/types"
import { Globe, Building2, Briefcase, ShoppingCart, Laptop, Terminal, Database, Shield, Code, HelpCircle, BookOpen, Scale, CheckCircle2, MessageCircle } from "lucide-react"

const iconMap = {
  region: Globe,
  vertical: {
    enterprise: Laptop,
    financial: Building2,
    retail: ShoppingCart,
    services: Briefcase,
  },
  persona: {
    devops: Terminal,
    database: Database,
    security: Shield,
    developer: Code,
  },
  phase: {
    "problem-exploration": HelpCircle,
    "solution-education": BookOpen,
    "solution-comparison": Scale,
    "solution-evaluation": CheckCircle2,
    "user-feedback": MessageCircle,
  },
}

function generateMetrics() {
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

const mockData: Record<Stage, SelectionCard[]> = {
  company: [
    { id: "americas", title: "Americas", description: "North and South America regions", icon: Globe, metrics: generateMetrics() },
    { id: "emea", title: "EMEA", description: "Europe, Middle East, and Africa", icon: Globe, metrics: generateMetrics() },
    { id: "apac", title: "APAC", description: "Asia Pacific region", icon: Globe, metrics: generateMetrics() },
  ],
  region: [
    { id: "enterprise-software", title: "Enterprise Software", description: "Business software and enterprise solutions", icon: iconMap.vertical.enterprise, metrics: generateMetrics() },
    { id: "financial-services", title: "Financial Services", description: "Banking, insurance, and fintech", icon: iconMap.vertical.financial, metrics: generateMetrics() },
    { id: "retail", title: "Retail", description: "E-commerce and retail businesses", icon: iconMap.vertical.retail, metrics: generateMetrics() },
    { id: "professional-services", title: "Professional Services", description: "Consulting and professional services", icon: iconMap.vertical.services, metrics: generateMetrics() },
  ],
  vertical: [
    { id: "devops-lead", title: "DevOps Lead", description: "Infrastructure and deployment decision makers", icon: iconMap.persona.devops, metrics: generateMetrics() },
    { id: "database-architect", title: "Database Architect", description: "Database and data infrastructure specialists", icon: iconMap.persona.database, metrics: generateMetrics() },
    { id: "security-engineer", title: "Security Engineer", description: "Security and compliance professionals", icon: iconMap.persona.security, metrics: generateMetrics() },
    { id: "software-developer", title: "Software Developer", description: "Application developers and engineers", icon: iconMap.persona.developer, metrics: generateMetrics() },
  ],
  persona: [
    ...["problem-exploration", "solution-education", "solution-comparison", "solution-evaluation", "user-feedback"].flatMap((phase) => ([
      {
        id: `${phase}-1`,
        title: `${phase.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")} Query 1`,
        description: "Sample query description",
        icon: iconMap.phase[phase as Phase],
        metrics: generateMetrics(),
        phase: phase as Phase,
      },
      {
        id: `${phase}-2`,
        title: `${phase.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")} Query 2`,
        description: "Sample query description",
        icon: iconMap.phase[phase as Phase],
        metrics: generateMetrics(),
        phase: phase as Phase,
      },
    ])),
  ],
  query: [], // Query stage doesn't need cards
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const stage = searchParams.get("stage") as Stage
  const region = searchParams.get("region")
  const vertical = searchParams.get("vertical")
  const persona = searchParams.get("persona")
  const sortBy = searchParams.get("sortBy")
  const timeFrame = searchParams.get("timeFrame")

  try {
    // TODO: Replace with actual database query
    // This is a mock implementation
    const cards = mockData[stage] || []

    return NextResponse.json(cards)
  } catch (error) {
    console.error("Error fetching cards:", error)
    return NextResponse.json(
      { error: "Failed to fetch cards" },
      { status: 500 }
    )
  }
} 