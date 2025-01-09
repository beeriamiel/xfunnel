# API Documentation

## Response Processing API
- POST `/api/process-responses`
  - Batch processes responses
  - Handles chunked processing
  - Extracts and validates citations
  - Returns processing status

## Analysis API
- POST `/api/analyze`
  - Performs multi-dimensional analysis
  - Processes citations and URLs
  - Supports various metrics
  - Returns structured insights

## Dashboard API
- GET `/api/metrics`
  - Fetches aggregated metrics
  - Supports filtering and grouping
  - Real-time updates

## Data Models

1. Response Analysis
   - Sentiment scoring
   - Ranking analysis
   - Citation parsing and validation
     - URL extraction and cleaning
     - Citation metadata enrichment
     - Order preservation
   - Feature detection

2. Citations
   - URL validation and normalization
   - Citation order tracking
   - Metadata enrichment
     - Company association
     - Response context
     - Buyer journey mapping
     - Geographic targeting
     - Domain authority tracking
       - Moz API integration
       - Last crawled timestamp handling
       - Domain/Page authority metrics
       - Spam score tracking
     - Source type classification
     - Query text association
     - Content analysis storage
   - Transaction-based processing
   - Optimized database indexes
     - Citation order
     - Response analysis ID
     - Company ID
     - Created at (descending)

3. Metrics Aggregation
   - Geographic grouping
   - Industry segmentation
   - Persona categorization
   - Journey stage mapping
   - Citation analytics

## Error Handling
- Standard error responses
- Retry mechanisms
- Rate limiting
- Citation validation errors 

## External Integrations
- Moz API
  - Domain authority enrichment
  - Page authority metrics
  - Spam score analysis
  - Last crawled data tracking
  - Empty timestamp handling 

## External APIs

### Firecrawl API
- Base URL: `https://api.firecrawl.dev/v1`
- Used for scraping web content and converting to markdown
- Key features:
  - Converts web pages to clean markdown
  - Handles rate limiting and retries
  - Supports timeout configuration
  - Filters out PDFs and documents
- Response structure:
  ```json
  {
    "success": boolean,
    "data": {
      "markdown": string,
      "metadata": {
        "title": string,
        "description": string,
        "language": string,
        "sourceURL": string
      }
    }
  }
  ``` 

## Citation Processing

### URL Classification
- Automatic source type classification:
  - OWNED: Company's own domain (fuzzy matched)
  - COMPETITOR: Competitor domains (fuzzy matched)
  - UGC: User-generated content sites (50+ domains)
  - EARNED: All other sources
- Enhanced company name normalization:
  - Handles periods and special characters
  - Consistent domain matching
  - Improved fuzzy matching

### Processing Pipeline
- Decoupled processing stages:
  1. Citation Creation
  2. Content/Moz Processing
  3. Content Analysis
  4. Company Mention Counting

- Enhanced error isolation:
  - Separate error handling per stage
  - Non-blocking company mention processing
  - Preserved citation data on failures

### Database Schema
Citations table includes:
- source_type: ENUM ('OWNED', 'COMPETITOR', 'UGC', 'EARNED')
- Default: 'EARNED'
- NOT NULL constraint
- New fields:
  - content_analysis_updated_at
  - moz_last_crawled
  - moz_last_updated
  - page_authority
  - spam_score
  - root_domains_to_root_domain
  - external_links_to_root_domain

## Content Analysis API
- POST `/api/analyze-content`
  - Analyzes content using Claude
  - Strict JSON validation
  - Format requirements:
    - No trailing commas
    - Valid number formats (0-100)
    - Proper quote usage
    - Exact property names
  - Error handling for malformed responses 

# Citation Processing Pipeline

## Overview
The citation processing pipeline handles extraction, enrichment, and analysis of citations from AI responses.

## Flow
1. URL Extraction & Validation
   - Clean and validate URLs
   - Remove formatting artifacts
   - Check URL validity

2. Citation Reuse Check
   - Check for existing citations within 120 days
   - Split into new vs reusable citations
   - Copy enrichment data for reuse

3. Batch Processing
   - Insert new citations
   - Create references to existing citations
   - Maintain citation order and metadata

4. Content Enrichment
   - Moz data enrichment (domain authority, spam score, etc)
   - Content scraping via Firecrawl
   - Content analysis and metrics calculation

5. Company Mention Processing
   - Count company mentions in content
   - Update mention statistics
   - Track mention context

## Integration Points
- Called from generate-claude-response.ts
- Called from generate-gemini-response.ts
- Integrated with analysis.ts
- Uses Firecrawl for content
- Uses Moz for domain metrics

## Error Handling
- Transaction-level error boundaries
- Content scraping retry logic
- Non-blocking enrichment failures 

## Authentication & Authorization

### Auth System
1. Session Management
   - Cookie-based auth with SSR support
   - Async cookie operations for Next.js
   - Session refresh in middleware
   - Protected route enforcement

2. Auth Endpoints
   - GET `/auth/callback`
     - Handles OAuth and email verification
     - Establishes sessions
     - Creates account associations
     - Role-based redirects
   - POST `/api/test-auth`
     - Validates auth state
     - Returns user context

3. Authorization Flow
   - RLS policy enforcement
   - Account-scoped data access
   - Role-based permissions:
     ```sql
     - Regular users: Account-scoped access
     - Account admins: Account management
     - Super admins: Global access
     ```

4. Data Access Control
   - Companies table:
     ```sql
     - Account-based filtering
     - User role verification
     - Super admin bypass
     ```
   - Analysis data:
     ```sql
     - Account-scoped queries
     - Role-based limitations
     - Audit logging
     ``` 