import { getBuyingJourneyMetrics, getEnginePerformance } from '../actions'
import { JOURNEY_STAGES } from '../types'

describe('Dashboard Actions', () => {
  test('getBuyingJourneyMetrics returns correctly typed data', async () => {
    const metrics = await getBuyingJourneyMetrics()
    
    expect(metrics.length).toBeGreaterThan(0)
    metrics.forEach(metric => {
      expect(JOURNEY_STAGES).toContain(metric.stage)
      expect(metric.metrics).toMatchObject({
        sentimentScore: expect.any(Number),
        rankingPosition: expect.any(Number),
        recommendationRate: expect.any(Number),
        mentionRate: expect.any(Number),
        totalResponses: expect.any(Number)
      })
    })
  })
}) 