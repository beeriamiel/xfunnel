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