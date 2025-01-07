Project Overview
We are building a Buying Journey Dashboard that allows users to explore performance metrics across regions, industries, and buyer personas, with a focus on search queries. The dashboard will help users analyze how their company is mentioned and ranked across different platforms (e.g., Perplexity, Claude, Gemini) and how these metrics change over time.

The dashboard will have a horizontal, stage-by-stage navigation flow, where users can drill down from a high-level view (e.g., Regions) to granular details (e.g., Queries). Each stage will display key metrics (Average Sentiment, Average Position, Company Mentioned, Recommendation Probability) and a timeline chart showing trends over time.

The project will be built in two stages:

Stage 1: Build the dashboard structure with mock data.

Stage 2: Connect the dashboard to the Supabase response_analysis table and implement sorting/filtering functionality.

Stage 1: Building the Dashboard Structure with Mock Data
Goal
Create a fully functional dashboard structure with mock data, focusing on the horizontal navigation flow, UI/UX design, and key metrics display.

Detailed Instructions
1. Horizontal Navigation
Progress Bar:

Create a progress bar at the top of the dashboard that shows the current stage (Total Company → Regions → Verticals → Personas → Queries).

Each stage should be clickable, allowing users to navigate back to previous stages.

Stage Replacement:

When a user selects a stage (e.g., Regions), the current stage should replace the previous one (e.g., Total Company).

Ensure smooth transitions between stages.

2. Contextual Information
Metrics Display:

For each stage, display the following metrics:

Average Sentiment

Average Position

Company Mentioned

Recommendation Probability

Use clean, modern UI components (e.g., cards, tables) to display these metrics.

Timeline Chart:

Add a timeline chart below the metrics to show trends over time for the selected phase.

Use a line chart or area chart with interactive tooltips.

Ensure the chart updates dynamically when the user selects a new stage.

3. Selection Cards
Regions:

Display region cards (e.g., Americas, EMEA) with key metrics and a button to explore verticals.

Verticals:

Display vertical cards (e.g., Enterprise Software, Financial Services) with key metrics and a button to explore personas.

Personas:

Display persona cards (e.g., DevOps Lead, Database Architect) with key metrics and a button to explore queries.

Queries:

Display query cards organized by buying journey phases (Problem Exploration, Solution Education, Solution Comparison, Solution Evaluation, User Feedback).

Each query card should be expandable to show platform-level rankings (e.g., Perplexity, Claude, Gemini).

4. Mock Data
Data Structure:

Use mock data to populate the dashboard. For example:

Regions:

json
Copy
{
  "region": "Americas",
  "metrics": {
    "average_sentiment": 48,
    "average_position": 2.8,
    "company_mentioned": 42,
    "recommendation_probability": 52
  }
}
Queries:

json
Copy
{
  "query": "Database schema automation tools comparison",
  "metrics": {
    "average_sentiment": 45,
    "average_position": 3,
    "company_mentioned": true,
    "recommendation_probability": 48
  },
  "platform_rankings": {
    "Perplexity": 3,
    "Claude": 1,
    "Gemini": 4
  }
}
Scalability:

Ensure the structure is scalable for real data integration in the next stage.

5. UI/UX Principles
Visual Hierarchy:

Use cards for selections, expandable sections for details, and charts for trends.

Responsive Design:

Ensure usability across devices (desktop, tablet, mobile).

Accessibility:

Follow WCAG guidelines for color contrast, font size, and keyboard navigation.

Expected Output
A fully functional dashboard with mock data.

Horizontal navigation with progress bar.

Key metrics and timeline chart for each stage.

Interactive cards for selecting regions, verticals, personas, and queries.

Query-level details organized by buying journey phases.

Stage 2: Connecting Supabase Data to the Dashboard
Goal
Integrate the Supabase response_analysis table into the dashboard, mapping data points to the UI components and enabling sorting/filtering functionality.

Detailed Instructions
1. Data Mapping
Regions:

Use geographic_region to group data by region.

Calculate metrics:

Average Sentiment: sentiment_score

Average Position: ranking_position

Company Mentioned: company_mentioned

Recommendation Probability: recommended (convert boolean to percentage).

Rank top competitors using mentioned_companies.

Verticals:

Use industry_vertical to group data by vertical.

Calculate the same metrics as above.

Personas:

Use buyer_persona to group data by persona.

Calculate the same metrics as above.

Queries:

Use query_text and buying_journey_stage to organize queries by buying journey phases.

Parse rank_list to show platform-level rankings (e.g., Perplexity, Claude, Gemini).

2. Sorting and Filtering
By Batch:

Use analysis_batch_id to filter results for a specific batch.

Calculate percentage changes compared to the previous batch.

Display batch ID and creation date (created_at).

By Time:

Use created_at to aggregate results by week or month.

Calculate percentage changes compared to the previous week/month.

Display time periods in a user-friendly format (e.g., “Jan Week 1”, “February”).

3. Timeline Chart Integration
Use created_at for time and relevant metrics (sentiment_score, ranking_position, etc.) to show trends over time.

Update the chart dynamically based on the selected phase.

4. Query-Level Details
Fetch and display platform-level rankings (rank_list) for each query.

Organize queries by buying journey phases using buying_journey_stage.

5. Error Handling and Optimization
Ensure error handling for Supabase queries.

Optimize data fetching and processing for performance.

Expected Output
A fully functional dashboard connected to the Supabase response_analysis table.

Accurate data mapping for regions, verticals, personas, and queries.

Sorting and filtering functionality by batch and time.

Dynamic timeline chart showing trends over time.

Query-level details with platform rankings and buying journey phases.