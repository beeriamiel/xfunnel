AIEO Product Spec
Background: 
The objective of this dashboard is o show how well a company performs across Answering Engines (ChatGPT, Perplexity, Claude, Google Gemini) by viewing their performance across a series of parameters on queries that users may ask at different parts of their buying journey. 
Objectives: 
Enable companies to monitor their ranking on AI engines across customer queries
Enable companies to monitor how accurately AI engines respond to questions about them
Enable companies to understand where there are gaps in their coverage with AI answering engines (Verify information accuracy). 
Help companies improve their performance on AI answering engines by increasing accuracy, and ranking, and citations. 
Ideal customer profile
Company 
B2B software companies that sell to mid-market & enterprise
Persona
VP/Director of Marketing
Use cases: 
Phase 1
Enable user to see expected queries a buyer would search across different parts of buying journey
Enable user to see and compare how it ranks across the AI engines for each ranking query
Enable user to see the actual response each of the answering engines provided for each query
Enable user to see and compare when answering engines recommended their solution when asked to make a recommendation by a buyer
Enable users to see which links they own were cited by the response




Included answering engines:
ChatGPT
Google Gemini
Perplexity
Claude
Google Search
X (Twitter)
Phase 1 Spec Details
Dashboard
Based on our existing excel dashboard

User inputs URL and Dashboard gets auto-populated:

Display the buyer’s journey phases like a funnel: 
Problem exploration
Solution Education
Solution Comparison
Solution Evaluation
Final Research
Maybe first is like a comparison from google search?
Display 2-5 expected query for each phase
Show comparison of all of the responses to the query
Show scoring for every question broken out by:
Show ranking score when the answer engines responses with a rank (displayed as the rank out of how many competitors. 
Show recommendation when it responds with a direct recommendation (binary yes/no)
Show citation score - what % of sources that were cited does your company own
Show overall score for every answer engine

# Real-Time Dashboard Implementation Plan

## Overview
This plan outlines the implementation of the real-time dashboard using Next.js App Router, React Server Components, and the existing database structure.

## Database Structure (Existing Tables)
Using tables from migration.sql:

1. `response_analysis`
   - sentiment_score
   - ranking_position
   - recommended
   - company_mentioned
   - geographic_region
   - industry_vertical
   - buyer_persona
   - buying_journey_stage
   - citations_parsed (JSONB)

2. `responses`
   - answer_engine
   - citations
   - websearchqueries
   - query_id (links to queries)

3. `queries`
   - query_text
   - buyer_journey_phase
   - user_id
   - company_id

## Implementation Plan

### 1. Server Component Migration
#### A. Component Analysis & Conversion
- **Server Components** (data fetching & display):
  - `OverviewCards` - uses response_analysis metrics
  - `CitationAnalysis` - uses citations_parsed from response_analysis
  - `JourneyAnalysis` - uses buying_journey_stage from response_analysis
  - `DashboardHeader` - static content
  - `ErrorMessage` - static content

- **Client Components** (keep for interactivity):
  - `DashboardMetrics` - manages real-time state
  - `ConnectionStatus` - real-time connection UI
  - `ErrorBoundary` - client-side error handling
  - `LoadingOverlay` - loading states

#### B. Data Structure (Using Existing Tables)
1. `response_analysis` as primary source:
   - sentiment_score → sentiment metrics
   - ranking_position → position metrics
   - citations_parsed → citation analysis
   - buying_journey_stage → journey metrics
   - geographic_region → regional analysis
   - industry_vertical → vertical analysis
   - buyer_persona → persona analysis

2. `responses` for engine data:
   - answer_engine → engine performance
   - citations → citation details
   - query_id → link to queries

3. `queries` for context:
   - query_text → query analysis
   - buyer_journey_phase → journey mapping
   - user_id → user context

### 2. Server-Side Implementation
#### A. Data Fetching Layer
1. Update `actions.ts` to:
   - Use proper table joins
   - Implement efficient filtering
   - Handle JSONB data properly
   - Return typed responses

2. Implement streaming:
   - Use Supabase realtime on response_analysis
   - Stream updates for metrics
   - Handle reconnection logic

#### B. Performance Optimization
1. Implement caching:
   - Cache stable data
   - Update only changed metrics
   - Use React cache()

2. Add suspense boundaries:
   - Wrap dynamic content
   - Show loading states
   - Handle streaming data

### 3. URL State Management
1. Filter State:
   - Date range
   - Competitors (from competitors table)
   - Engines (from responses.answer_engine)
   - Journey stages (from response_analysis.buying_journey_stage)

2. URL Syncing:
   - Update URL params
   - Handle browser navigation
   - Preserve filter state

### 4. Error Handling
1. Implement error boundaries:
   - Component-level errors
   - Data fetching errors
   - Connection errors

2. Add fallback states:
   - Loading skeletons
   - Error messages
   - Offline mode

### 5. Testing & Validation
1. Test data flow:
   - Server component rendering
   - Real-time updates
   - Error scenarios

2. Validate performance:
   - Initial load time
   - Update latency
   - Memory usage

# Implementation Plan

## 1. Data Processing Pipeline
**Goal**: Transform raw AI responses into structured, analyzed data that provides meaningful insights across multiple views.

### Data Flow
From Response Data:
```
responses {
  id: bigint
  query_id: bigint
  response_text: text
  answer_engine: text
  url: text
  citations: ARRAY[]
  websearchqueries: ARRAY[]
  created_at: timestamp
}
```

To Analyzed Data:
```
response_analysis {
  id: bigint
  response_id: bigint
  sentiment_score: float // 0-100%
  ranking_position: integer
  company_mentioned: boolean
  recommended: boolean
  citations: jsonb
  created_at: timestamp
  
  // Grouping fields
  geographic_region: text
  industry_vertical: text
  buyer_persona: text
  buying_journey_stage: text
}
```

### Core Metrics (Per View)
Each of these metrics is calculated for every view (Geographic Region, Industry Vertical, Buyer Persona, Buying Journey Stage):

1. **Average Sentiment** (0-100%)
   - Calculated from sentiment analysis of responses
   - Tracked over time for trend analysis

2. **Average Position** (ranking)
   - Extracted from responses mentioning rankings
   - Normalized across different response formats
   - Tracked over time for trend analysis

3. **Company Mentioned %**
   - Percentage of responses mentioning the company
   - Based on company name detection
   - Tracked over time for trend analysis

4. **Recommendation Probability**
   - Percentage of responses recommending the company
   - Based on recommendation detection
   - Tracked over time for trend analysis

### Views

1. **Geographic Region View**
   - Metrics grouped by region
   - Regional comparison
   - Time-based trends per region

2. **Industry Vertical View**
   - Metrics grouped by industry
   - Industry comparison
   - Time-based trends per industry

3. **Buyer Persona View**
   - Metrics grouped by persona
   - Persona comparison
   - Time-based trends per persona

4. **Buying Journey Stage View**
   - Metrics grouped by stage
   - Stage comparison
   - Time-based trends per stage

### Processing Pipeline Steps

1. **Response Analysis**
   - Sentiment analysis (0-100%)
   - Ranking extraction
   - Company mention detection
   - Recommendation detection

2. **Grouping & Aggregation**
   - Group by each view dimension
   - Calculate averages per group
   - Calculate trends over time

3. **Trend Analysis**
   - Compare current vs previous periods
   - Calculate percentage changes
   - Generate trend indicators (+/-)

### Scaling Strategy
**Goal**: Enable efficient processing of large volumes of responses while maintaining system responsiveness.

1. **Question Generation & Analysis Flow**
   - Generate questions and responses continuously
   - Queue each response for immediate analysis
   - Process responses in parallel with generation
   - Return results to user without waiting for analysis

2. **Chunked Processing**
   ```
   processResponseChunk():
   - Process N responses at a time (e.g., 100)
   - Batch insert analysis results
   - Track progress per chunk
   - Handle failures gracefully
   ```

3. **Queue Management**
   ```
   queueForAnalysis():
   - Add responses to processing queue
   - Process when chunk size reached
   - Continue accepting new responses
   - Track queue status
   ```

4. **Progress Tracking**
   - Monitor total responses to process
   - Track completed analyses
   - Log failed responses
   - Provide status updates

5. **Error Handling**
   - Log failed response IDs
   - Continue processing next chunk
   - Queue failed responses for retry
   - Maintain system stability

### Response Analysis Implementation Plan

#### Data Flow
From Response Data:
```
responses {
  id: number
  query_id: number
  response_text: string
  answer_engine: string
  citations: string[]
  websearchqueries: string[]
}
```

To Analyzed Data in response_analysis:
```
response_analysis {
  id: number
  response_id: number
  sentiment_score: number
  ranking_position: number
  company_mentioned: boolean
  recommended: boolean
  citations_parsed: {
    urls: string[]
    context: string[]
    relevance: number[]
    source_types: string[]
  }
  geographic_region: string
  industry_vertical: string
  buyer_persona: string
  buying_journey_stage: string
}
```

#### Processing Pipeline Steps

1. **Question Generation & Analysis Flow**
   - Generate questions and responses continuously
   - Queue each response for immediate analysis
   - Process responses in parallel with generation
   - Return results to user without waiting for analysis

2. **Chunked Processing**
   ```
   processResponseChunk():
   - Process N responses at a time (e.g., 100)
   - Batch insert analysis results
   - Track progress per chunk
   - Handle failures gracefully
   ```

3. **Queue Management**
   ```
   queueForAnalysis():
   - Add responses to processing queue
   - Process when chunk size reached
   - Continue accepting new responses
   - Track queue status
   ```

4. **Progress Tracking**
   - Monitor total responses to process
   - Track completed analyses
   - Log failed responses
   - Provide status updates

5. **Error Handling**
   - Log failed response IDs
   - Continue processing next chunk
   - Queue failed responses for retry
   - Maintain system stability

#### Implementation Phases
1. Queue management and chunk processing
   - Set up queue system
   - Implement batch processing
   - Add batch insert capability

2. Question generation integration
   - Connect to existing question generation
   - Add response queueing on generation
   - Implement parallel processing

3. Progress tracking system
   - Add progress monitoring
   - Implement status updates
   - Create progress dashboard

4. Error handling and retry mechanism
   - Add error logging
   - Implement retry logic
   - Create error reporting

#### Success Metrics
- Successfully process and analyze responses in batches of 100
- Maintain processing speed under high load
- Zero data loss during processing
- Clear visibility into processing status
- Successful retry of failed analyses

### Implementation Phases
1. Queue management and chunk processing
2. Question generation integration
3. Progress tracking system
4. Error handling and retry mechanism

## 2. Dashboard Integration
**Goal**: Integrate analytics dashboard to visualize AI response performance metrics and provide actionable insights across multiple answering engines.

### Technical Architecture
```
/protected
  ├── /page.tsx (generate queries page)
  └── /dashboard
      └── page.tsx (analytics dashboard)
```

### Integration Components
- Dashboard visualization components
- Data processing pipeline
- Real-time updates system
- Authentication flow integration

## 3. Testing Strategy
**Goal**: Ensure reliability and accuracy of both dashboard and data processing.
- Unit tests for data processing
- Integration tests for dashboard
- End-to-end flow testing
- Performance testing

## Success Metrics
- Dashboard provides accurate insights across all included answering engines
- Real-time updates of query performance
- Accurate scoring across ranking, recommendations, and citations
- Reliable data processing pipeline
- Responsive user interface with minimal latency

## Dashboard Implementation Plan

### 1. Server Component Data Fetching
```typescript
interface BuyingJourneyMetrics {
  // Per journey stage
  stage: string
  metrics: {
    sentimentScore: number
    rankingPosition: number
    recommendationRate: number
    mentionRate: number
    totalResponses: number
  }
}
```

### 2. Database Query Plan
```sql
-- 1. Get metrics aggregated by buying_journey_stage
SELECT 
  buying_journey_stage,
  COUNT(*) as total_responses,
  AVG(sentiment_score) as avg_sentiment,
  AVG(ranking_position) as avg_position,
  (COUNT(*) FILTER (WHERE recommended = true)::float / COUNT(*))*100 as recommendation_rate,
  (COUNT(*) FILTER (WHERE company_mentioned = true)::float / COUNT(*))*100 as mention_rate
FROM response_analysis
GROUP BY buying_journey_stage;

-- 2. Get performance by AI engine within each stage
SELECT 
  r.answer_engine,
  ra.buying_journey_stage,
  AVG(ra.sentiment_score) as avg_sentiment,
  AVG(ra.ranking_position) as avg_position
FROM response_analysis ra
JOIN responses r ON ra.response_id = r.id
GROUP BY r.answer_engine, ra.buying_journey_stage;
```

### 3. Implementation Phases

#### Phase 1: Basic Data Connection
- Create server component data fetching
- Replace placeholder boxes with real data
- Implement basic error handling

#### Phase 2: Real-time Updates
- Add real-time subscription for updates
- Implement optimistic updates
- Add loading states

#### Phase 3: Filtering & Interaction
- Add date range filtering
- Add engine comparison
- Implement drill-down views

### 4. File Structure
```
app/
  dashboard/
    page.tsx                    # Main dashboard page
    loading.tsx                 # Loading state
    error.tsx                   # Error handling
    actions.ts                  # Server actions for data fetching
    types.ts                    # TypeScript interfaces
```

### 5. Frontend Migration Plan

#### Overview
Moving functionality from page.tsx to real-time-dashboard.tsx and connecting to backend data sources.

#### 1. Type System Updates (types.ts)
```typescript
// Add new types for citations and analysis
export interface Citation {
  id: string
  title: string
  url: string
  source: {
    type: 'Documentation' | 'Blog' | 'GitHub' | 'Guide' | 'Tutorial'
    lastUpdated: string
    section?: string
  }
  sentiment: 'Positive' | 'Neutral' | 'Negative'
}

export interface TopCitation {
  id: string
  title: string
  date: string
  sentiment: 'Positive' | 'Neutral' | 'Negative'
  referenceCount: number
}
```

#### 2. Backend Actions (actions.ts)
```typescript
export async function getTopCitations(): Promise<TopCitation[]> {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  if (!user) throw new Error('Not authenticated')

  const result = await supabase
    .from('response_analysis')
    .select(`
      citations_parsed,
      sentiment_score,
      created_at,
      responses!inner(
        queries!responses_query_id_fkey!inner(
          user_id
        )
      )
    `)
    .eq('responses.queries.user_id', user.id)
    .order('created_at', { ascending: false })
}
```

#### 3. Component Migration Steps

1. **Move UI Components**
   - Transfer UI components from page.tsx to real-time-dashboard.tsx
   - Maintain existing real-time functionality
   - Add citation analysis sections

2. **State Management**
```typescript
interface RealTimeDashboardProps {
  initialMetrics: BuyingJourneyMetrics[]
  initialEnginePerformance: EnginePerformance[]
  initialTopCitations: TopCitation[]
}

export function RealTimeDashboard({ 
  initialMetrics,
  initialEnginePerformance,
  initialTopCitations
}: RealTimeDashboardProps) {
  const [metrics, setMetrics] = useState(initialMetrics)
  const [enginePerformance, setEnginePerformance] = useState(initialEnginePerformance)
  const [topCitations, setTopCitations] = useState(initialTopCitations)
}
```

3. **Real-Time Updates**
```typescript
useEffect(() => {
  const supabase = createClient()
  
  async function fetchCitationUpdates() {
    const updatedCitations = await getTopCitations()
    setTopCitations(updatedCitations)
  }

  const channel = supabase
    .channel('citation_updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'response_analysis',
        filter: 'citations_parsed is not null'
      },
      async () => {
        await fetchCitationUpdates()
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

#### 4. Implementation Order
1. Update types.ts with new interfaces
2. Add new backend actions in actions.ts
3. Update page.tsx to fetch initial citation data
4. Migrate UI components from front_end/page.tsx to real-time-dashboard.tsx
5. Add real-time updates for citations
6. Test and verify real-time functionality

#### Success Metrics
- Successful migration of all UI components
- Real-time updates working for all data types
- No regression in existing functionality
- Improved performance with backend data
- Consistent user experience throughout migration





