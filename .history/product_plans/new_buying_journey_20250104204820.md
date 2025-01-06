Buying Journey Dashboard Specification
Goal
Provide a seamless, horizontal navigation experience that allows users to drill down from a high-level company view into specific segments (region, vertical, persona, queries) while displaying contextual information at each stage.

Key Metrics at All Levels
Every level (Region, Vertical, Persona, Queries) will display the following metrics, mapped to the response_analysis table:

Company Mentioned: company_mentioned

Average Position: ranking_position

Feature Score: Derived from solution_analysis (e.g., percentage of "Yes" responses in Solution Evaluation).

Average Sentiment: sentiment_score

Navigation Flow
The dashboard will follow a horizontal, stage-by-stage navigation with a progress bar-like display at the top. Each stage will replace the previous one, and contextual information about the current stage will be displayed above the selection cards.

1. Total Company View (First Page)
Purpose: Provide an overview of the company’s performance across all regions.

UI Elements:

Progress Bar: Displays stages (Total Company → Regions → Verticals → Personas → Queries).

Contextual Information:

Charts showing trends over time (e.g., Average Sentiment, Feature Score).

Key metrics for the entire company (future feature).

Selection Cards:

Region cards to choose from (e.g., Americas, EMEA).

Data Source: geographic_region (grouped and aggregated).

2. Region View (Second Page)
Purpose: Focus on a selected region and provide insights into its performance.

UI Elements:

Progress Bar: Highlights the current stage (Regions).

Contextual Information:

Metrics for the selected region (e.g., Average Sentiment, Feature Score).

Data Source: geographic_region, sentiment_score, ranking_position, company_mentioned, solution_analysis.

Charts showing trends for the region (future feature).

Selection Cards:

Vertical cards to choose from (e.g., Enterprise Software, Financial Services).

Data Source: industry_vertical (grouped and aggregated).

3. Vertical View (Third Page)
Purpose: Analyze performance within a specific industry vertical.

UI Elements:

Progress Bar: Highlights the current stage (Verticals).

Contextual Information:

Metrics for the selected vertical (e.g., Average Position, Company Mentioned).

Data Source: industry_vertical, ranking_position, company_mentioned, sentiment_score, solution_analysis.

Charts comparing vertical performance (future feature).

Selection Cards:

Persona cards to choose from (e.g., DevOps Lead, Database Architect).

Data Source: buyer_persona (grouped and aggregated).

4. Persona View (Fourth Page)
Purpose: Dive into the behavior and preferences of a specific buyer persona.

UI Elements:

Progress Bar: Highlights the current stage (Personas).

Contextual Information:

Metrics for the selected persona (e.g., Recommendation Probability, Average Sentiment).

Data Source: buyer_persona, sentiment_score, recommended, company_mentioned, solution_analysis.

Charts showing persona-specific trends (future feature).

Selection Cards:

Query cards organized by buying journey phase (e.g., Problem Exploration, Solution Comparison).

Data Source: buying_journey_stage, query_text, response_text, ranking_position, company_mentioned, solution_analysis.

5. Query View (Fifth Page)
Purpose: Analyze individual search queries relevant to the persona’s buying journey.

UI Elements:

Progress Bar: Highlights the current stage (Queries).

Contextual Information:

Metrics for the selected query (e.g., Average Position, Feature Rank).

Data Source: query_text, ranking_position, solution_analysis, company_mentioned, sentiment_score.

Detailed ranking contexts and competitor comparisons.

Data Source: rank_list, competitors_list, mentioned_companies.

Query Cards:

Organized by buying journey phase.

Data Source: buying_journey_stage.

Expandable to show platform-level rankings and full answers.

Data Source: answer_engine, ranking_position, response_text.

Buying Journey Phases (Query Level)
Queries are organized into the following phases, mapped to buying_journey_stage:

Problem Exploration

General questions where the company may appear.

Affected Metrics: company_mentioned.

Solution Education

Questions educating users about potential solutions.

Affected Metrics: company_mentioned.

Solution Comparison

Compare the company with competitors.

Affected Metrics: ranking_position.

Solution Evaluation

Evaluate product requirements and AI knowledge.

Affected Metrics: Derived from solution_analysis (e.g., percentage of "Yes" responses).

User Feedback

Capture real human opinions from forums like Reddit.

Affected Metrics: ranking_position.

Data Sorting Options
Users can sort data in two ways, mapped to analysis_batch_id and created_at:

By Batch:

View results for a specific batch.

Data Source: analysis_batch_id.

Percentage changes compared to the previous batch.

Batch ID displayed (e.g., “Batch: 2023-10-15”).

By Weeks or Months:

View results aggregated by week or month.

Data Source: created_at.

Percentage changes compared to the previous week/month.

Week format: “Jan Week 1”, “Jan Week 2”, etc.

Month format: “January”, “February”, etc.

UI/UX Principles
Horizontal Navigation:

Each stage replaces the previous one, with a progress bar indicating the current stage.

Clear, intuitive flow from Total Company → Regions → Verticals → Personas → Queries.

Contextual Information:

Display metrics and charts relevant to the current stage above the selection cards.

Future features can expand on this with more detailed insights.

Visual Hierarchy:

Use cards for selections, expandable sections for details, and charts for trends.

Consistent styling for a cohesive experience.

Responsive Design:

Ensure usability across devices (desktop, tablet, mobile).

Accessibility:

Follow WCAG guidelines for color contrast, font size, and keyboard navigation.

Future Features
Competitor Analysis: Highlight top competitors at each stage.

Data Source: competitors_list, mentioned_companies.

Custom Reporting: Allow users to export data or generate custom reports.

AI Insights: Provide AI-driven recommendations based on query trends.

Interactive Charts: Enable users to interact with charts for deeper insights.