import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { ResponseAnalysis } from '@/app/dashboard/buying-journey/types'

type RawResponseAnalysis = Omit<ResponseAnalysis, 'solution_analysis' | 'citations_parsed'> & {
  solution_analysis: string | null
  citations_parsed: string | null
}

export async function POST(request: Request) {
  try {
    const { query } = await request.json()

    // Execute the query
    const { rows } = await sql<RawResponseAnalysis>`${query}`

    // Parse JSON fields
    const parsedRows = rows.map((row: RawResponseAnalysis) => ({
      ...row,
      solution_analysis: row.solution_analysis
        ? JSON.parse(row.solution_analysis)
        : null,
      citations_parsed: row.citations_parsed
        ? JSON.parse(row.citations_parsed)
        : null,
      competitors_list: row.competitors_list || [],
      mentioned_companies: row.mentioned_companies || [],
    }))

    return NextResponse.json(parsedRows)
  } catch (error) {
    console.error('Error executing query:', error)
    return NextResponse.json(
      { error: 'Failed to fetch response analysis' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const batchId = searchParams.get('batchId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      )
    }

    let query = sql<RawResponseAnalysis>`
      SELECT *
      FROM response_analysis
      WHERE company_id = ${companyId}
    `

    if (batchId) {
      query = sql<RawResponseAnalysis>`
        ${query}
        AND analysis_batch_id = ${batchId}
      `
    }

    if (startDate && endDate) {
      query = sql<RawResponseAnalysis>`
        ${query}
        AND created_at >= ${startDate}
        AND created_at <= ${endDate}
      `
    }

    query = sql<RawResponseAnalysis>`
      ${query}
      ORDER BY created_at DESC
    `

    const { rows } = await query

    // Parse JSON fields
    const parsedRows = rows.map((row: RawResponseAnalysis) => ({
      ...row,
      solution_analysis: row.solution_analysis
        ? JSON.parse(row.solution_analysis)
        : null,
      citations_parsed: row.citations_parsed
        ? JSON.parse(row.citations_parsed)
        : null,
      competitors_list: row.competitors_list || [],
      mentioned_companies: row.mentioned_companies || [],
    }))

    return NextResponse.json(parsedRows)
  } catch (error) {
    console.error('Error executing query:', error)
    return NextResponse.json(
      { error: 'Failed to fetch response analysis' },
      { status: 500 }
    )
  }
} 