# Product Plans

## Citations System Implementation

### Current Table Structure
```sql
create table public.citations (
  id bigint generated always as identity not null,
  created_at timestamp with time zone null default now(),
  citation_url text not null,
  citation_order integer not null,
  response_analysis_id bigint not null,
  company_id bigint not null,
  recommended boolean null,
  company_mentioned boolean null,
  buyer_persona text null,
  buyer_journey_phase text null,
  rank_list text null,
  mentioned_companies text[] null,
  icp_vertical text null,
  response_text text null,
  region text null,
  ranking_position integer null,
  updated_at timestamp with time zone null default current_timestamp,
  domain_authority numeric null,
  page_authority numeric null,
  spam_score numeric null,
  root_domains_to_root_domain integer null,
  external_links_to_root_domain integer null,
  moz_last_crawled timestamp with time zone null,
  moz_last_updated timestamp with time zone null,
  constraint citations_pkey primary key (id)
);

-- Indexes for optimized queries
create index if not exists idx_citations_company_id on public.citations using btree (company_id);
create index if not exists idx_citations_response_analysis_id on public.citations using btree (response_analysis_id);
create index if not exists idx_citations_created_at on public.citations using btree (created_at desc);
create index if not exists idx_citations_citation_order on public.citations using btree (citation_order);

-- Update trigger for timestamps
create trigger update_citations_updated_at before
update on citations for each row
execute function update_updated_at_column();
```

### Implementation Details

1. Citation Processing System
   - `citation-processor.ts`
     - URL validation and normalization
     - Metadata enrichment
     - Transaction handling
     - Error handling and logging
   - Moz API Integration
     - ✅ Nested response handling
     - ✅ Accurate logging
     - ✅ Error monitoring

2. Integration Points
   - `processor.ts`:
     - Citation extraction after response analysis
     - Transaction coordination
     - Error handling
   
   - `queue.ts`:
     - Batch citation processing
     - Transaction management
     - Retry mechanisms

3. Data Flow
   a) Response Analysis:
      - Extract citations from response
      - Parse and validate URLs
      - Prepare metadata
   
   b) Citation Processing:
      - Validate URLs
      - Normalize formats
      - Enrich with metadata
      - Handle transactions
   
   c) Storage:
      - Insert into citations table
      - Update response analysis
      - Maintain referential integrity

4. Optimization Features
   - Batch processing
   - Indexed queries
   - Transaction handling
   - Error recovery
   - Logging and monitoring

5. Content Analysis
   - ✅ Claude response validation
   - ✅ Strict JSON formatting
   - ✅ Error handling
   - ✅ Detailed logging

### Success Metrics
- All citations properly extracted and stored
- URLs validated and normalized
- Metadata correctly enriched
- No orphaned citation records
- Proper error handling and logging
- Transaction integrity maintained 
- Accurate Moz API response logging
- Valid Claude JSON responses
- Proper error handling and recovery

## Implemented Features

### URL Classification
- ✅ Automatic source type detection
- ✅ UGC site recognition
- ✅ Company domain matching
- ✅ Competitor identification

## Future Enhancements
- [ ] Expand UGC domain list
- [ ] Improve fuzzy matching accuracy
- [ ] Add classification statistics
- [ ] Source type analytics 