# System Architecture

## Overview
- Purpose: AI Response Analysis Platform
- Core functionality: Process, analyze, and visualize AI model responses
- Key metrics: Sentiment, Rankings, Company Mentions, Recommendations, Citations

## System Components
1. Data Collection Pipeline
   - Multiple AI engine integration (OpenAI, Gemini, Claude, etc.)
   - Response collection and storage
   - Citation extraction and validation
   - URL normalization and metadata enrichment

2. Analysis Pipeline
   - Batch processing system
   - Real-time analysis
   - Multi-dimensional analytics (Region, Industry, Persona, Journey Stage)
   - Citation processing and tracking
     - URL validation
     - Order preservation
     - Metadata enrichment
     - Company association

3. Dashboard System
   - Real-time metrics visualization
   - Comparative analysis across engines
   - Citation analytics and tracking
   - Hierarchical navigation (Region → Industry → Persona → Query)

## Data Flows
1. Response Generation
   - Query generation
   - Multi-engine response collection
   - Citation extraction and validation
   - URL normalization

2. Analysis Processing
   - Sentiment analysis
   - Ranking extraction
   - Company mention detection
   - Feature analysis
   - Citation processing
     - URL validation and cleaning
     - Order tracking
     - Metadata enrichment
     - Transaction handling
   - Metadata enrichment
     - Moz API integration for domain metrics
     - Conditional timestamp handling
     - Authority score tracking

3. Metrics Aggregation
   - Geographic segmentation
   - Industry vertical analysis
   - Buyer persona insights
   - Journey stage progression
   - Citation analytics
     - URL patterns
     - Source distribution
     - Company associations

## Technology Stack
- Frontend: Next.js App Router, React, Shadcn UI, Tailwind
- Backend: Node.js, TypeScript
- Database: Supabase (PostgreSQL)
  - Response analysis table
  - Citations table with metadata
  - Optimized indexes for citation queries
- State Management: URL state (nuqs)
- External APIs
  - Moz API for domain authority metrics
    - Domain/Page authority
    - Spam score analysis
    - Last crawled tracking

## Processing Pipeline
1. Response Collection
   - Multi-engine querying
   - Response storage
   - Citation extraction

2. Analysis Processing
   - Response analysis
   - Citation processing
   - Metadata enrichment
   - Transaction handling

3. Data Storage
   - Response analysis records
   - Citation records with metadata
     - Basic citation data (URL, order)
     - Analysis context (company, response)
     - Journey metadata (persona, phase)
     - Enhanced metadata
       - Domain authority
       - Source type
       - Query text
       - Content analysis
   - Optimized indexes
     - Citation order (btree)
     - Response analysis ID (btree)
     - Company ID (btree)
     - Created at desc (btree)
   - Automatic timestamp management
     - Created at defaulting
     - Updated at trigger
   - Referential integrity
   - Transaction handling 

## Content Processing Pipeline

### Content Scraping
- ContentScrapingQueue handles web content extraction
- Uses Firecrawl API for HTML to markdown conversion
- Implements content analysis:
  - Word count
  - Code block detection
  - Heading structure analysis
- Filters out PDFs and document types
- Handles rate limiting and retries
- Stores results in citations table with content analysis metadata 