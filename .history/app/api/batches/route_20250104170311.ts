import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

interface Batch {
  analysis_batch_id: string
  created_at: string
}

export async function POST(request: Request) {
  try {
    const { query } = await request.json()

    // Execute the query
    const { rows } = await sql<Batch>`${query}`

    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error executing query:', error)
    return NextResponse.json(
      { error: 'Failed to fetch batches' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      )
    }

    const { rows } = await sql<Batch>`
      SELECT DISTINCT
        analysis_batch_id,
        MIN(created_at) as created_at
      FROM response_analysis
      WHERE company_id = ${companyId}
      GROUP BY analysis_batch_id
      ORDER BY created_at DESC
    `

    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error executing query:', error)
    return NextResponse.json(
      { error: 'Failed to fetch batches' },
      { status: 500 }
    )
  }
} 