import { generateWizardData } from '../actions/generate'
import type { GeneratedData, GenerationProgress } from '../types'

export async function generateCompanyData(
  companyName: string,
  accountId: string,
  onProgress: (progress: GenerationProgress) => void
): Promise<GeneratedData> {
  try {
    onProgress({
      step: 'company',
      progress: 0,
      message: 'Starting company data generation...'
    })

    const data = await generateWizardData(companyName, accountId)

    onProgress({
      step: 'complete',
      progress: 100,
      message: 'Generation complete!'
    })

    return data
  } catch (error) {
    console.error('Company data generation failed:', error)
    throw error
  }
} 