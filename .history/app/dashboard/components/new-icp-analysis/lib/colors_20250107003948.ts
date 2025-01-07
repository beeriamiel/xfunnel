export function getCompanyMentionedColor(value: number): string {
  if (value >= 80) return "text-green-500"
  if (value >= 50) return "text-yellow-500"
  return "text-red-500"
}

export function getRankingPositionColor(value: number): string {
  if (value <= 1) return "text-green-500"
  if (value <= 3) return "text-yellow-500"
  return "text-red-500"
}

export function getFeatureScoreColor(value: number): string {
  if (value >= 90) return "text-green-500"
  if (value >= 70) return "text-yellow-500"
  return "text-red-500"
}

export function getSentimentColor(value: number): string {
  if (value >= 71) return "text-green-500"
  if (value >= 41) return "text-yellow-500"
  return "text-red-500"
} 