'use client'

import { useState } from 'react'
import { ResponseTable } from './components/analysis/response-table'

interface Props {
  companyId: number
}

export function GenerateAnalysis({ companyId }: Props) {
  // Mock data for now - this would come from your API
  const [icps] = useState([
    {
      id: "icp1",
      region: "North America",
      vertical: "SaaS",
      company_size: "50-200"
    },
    {
      id: "icp2",
      region: "Europe",
      vertical: "Fintech",
      company_size: "201-500"
    }
  ])

  const [personas] = useState([
    {
      id: "persona1",
      title: "Product Manager",
      seniority_level: "Senior",
      department: "Product"
    },
    {
      id: "persona2",
      title: "Engineering Lead",
      seniority_level: "Lead",
      department: "Engineering"
    }
  ])

  const handleGenerateQuestions = async (selectedIds: string[]) => {
    // TODO: Implement API call to generate questions
    console.log('Generating questions for:', selectedIds)
  }

  const handleGenerateResponses = async (selectedIds: string[]) => {
    // TODO: Implement API call to generate responses
    console.log('Generating responses for:', selectedIds)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Generate Analysis</h2>
          <p className="text-muted-foreground">
            Generate and analyze responses for your ICPs and personas
          </p>
        </div>
      </div>

      <ResponseTable
        icps={icps}
        personas={personas}
        onGenerateQuestions={handleGenerateQuestions}
        onGenerateResponses={handleGenerateResponses}
      />
    </div>
  )
} 