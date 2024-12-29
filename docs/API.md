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