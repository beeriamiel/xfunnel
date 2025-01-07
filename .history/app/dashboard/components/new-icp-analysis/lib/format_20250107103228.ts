// Special cases for region formatting
const SPECIAL_REGIONS = {
  'emea': 'EMEA',
  'latam': 'LATAM',
  'apac': 'APAC',
  'eu': 'EU',
  'uk': 'UK',
  'usa': 'USA'
} as const

/**
 * Formats region names from backend format to display format
 * Examples:
 * - "north_america" → "North America"
 * - "emea" → "EMEA"
 * - "south_east_asia" → "South East Asia"
 */
export function formatRegionName(region: string): string {
  // Convert to lowercase for consistent handling
  const lowerRegion = region.toLowerCase()
  
  // Check for special cases first
  if (lowerRegion in SPECIAL_REGIONS) {
    return SPECIAL_REGIONS[lowerRegion as keyof typeof SPECIAL_REGIONS]
  }
  
  // Replace underscores with spaces and apply title case
  return lowerRegion
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
} 