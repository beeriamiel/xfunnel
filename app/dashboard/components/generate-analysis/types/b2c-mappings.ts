export interface B2CToB2BMapping {
  ageGroup: string // maps to vertical
  incomeLevel: string // maps to company_size
  location: string // maps to region
  gender: string // maps to title
  additionalTraits: string[] // maps to department and seniority_level
}

// Predefined options for B2C fields
export const AGE_GROUPS = [
  '18-24',
  '25-34',
  '35-44',
  '45-54',
  '55-64',
  '65+'
] as const

export const INCOME_LEVELS = [
  'Under $25,000',
  '$25,000-$49,999',
  '$50,000-$74,999',
  '$75,000-$99,999',
  '$100,000-$149,999',
  '$150,000+'
] as const

export const GENDERS = [
  'Male',
  'Female',
  'Non-binary',
  'Prefer not to say'
] as const

export const ADDITIONAL_TRAITS = [
  'Tech-savvy',
  'Early adopter',
  'Price conscious',
  'Luxury oriented',
  'Environmentally conscious',
  'Health conscious',
  'Family oriented',
  'Career focused'
] as const

// Helper function to map B2C fields to B2B fields
export function mapB2CToB2B(b2cData: B2CToB2BMapping) {
  return {
    vertical: b2cData.ageGroup,
    company_size: b2cData.incomeLevel,
    region: b2cData.location,
    title: b2cData.gender,
    department: b2cData.additionalTraits[0] || 'General Consumer',
    seniority_level: b2cData.additionalTraits[1] || 'Consumer'
  }
} 