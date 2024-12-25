-- Test Script for Dashboard Real-time Updates

-- 1. Setup Test Data
-- Create a test company
INSERT INTO companies (name, industry) 
VALUES ('Test Company', 'Software') 
RETURNING id;

-- Create test queries
INSERT INTO queries (
  company_id,
  query_text,
  buyer_journey_phase
) VALUES 
(1, 'What are the best database solutions?', ARRAY['Problem Exploration']),
(1, 'How does PostgreSQL compare to MySQL?', ARRAY['Solution Comparison'])
RETURNING id;

-- Create test responses
INSERT INTO responses (
  query_id,
  response_text,
  answer_engine,
  url
) VALUES 
(1, 'PostgreSQL is a powerful database...', 'ChatGPT', 'https://test.com'),
(1, 'When considering databases...', 'Claude', 'https://test.com'),
(2, 'Comparing PostgreSQL and MySQL...', 'Gemini', 'https://test.com')
RETURNING id;

-- 2. Test Real-time Updates

-- Test 1: Insert new analysis
INSERT INTO response_analysis (
  response_id,
  sentiment_score,
  ranking_position,
  recommended,
  company_mentioned,
  buying_journey_stage
) VALUES 
(1, 85.5, 2, true, true, 'Problem Exploration'),
(2, 75.0, 3, false, true, 'Problem Exploration'),
(3, 90.0, 1, true, true, 'Solution Comparison');

-- Verify initial state
SELECT 
  buying_journey_stage,
  COUNT(*) as total_responses,
  ROUND(AVG(sentiment_score)::numeric, 2) as avg_sentiment,
  ROUND(AVG(ranking_position)::numeric, 2) as avg_position,
  ROUND((COUNT(*) FILTER (WHERE recommended = true)::float / COUNT(*) * 100)::numeric, 2) as recommendation_rate,
  ROUND((COUNT(*) FILTER (WHERE company_mentioned = true)::float / COUNT(*) * 100)::numeric, 2) as mention_rate
FROM response_analysis
GROUP BY buying_journey_stage
ORDER BY buying_journey_stage;

-- Test 2: Update existing analysis
UPDATE response_analysis
SET 
  sentiment_score = 95.0,
  ranking_position = 1,
  recommended = true
WHERE response_id = 2;

-- Test 3: Check engine performance
SELECT 
  r.answer_engine,
  ra.buying_journey_stage,
  ROUND(AVG(ra.sentiment_score)::numeric, 2) as avg_sentiment,
  ROUND(AVG(ra.ranking_position)::numeric, 2) as avg_position
FROM response_analysis ra
JOIN responses r ON ra.response_id = r.id
GROUP BY r.answer_engine, ra.buying_journey_stage
ORDER BY r.answer_engine, ra.buying_journey_stage;

-- Cleanup (if needed)
-- DELETE FROM response_analysis WHERE response_id IN (1, 2, 3);
-- DELETE FROM responses WHERE query_id IN (1, 2);
-- DELETE FROM queries WHERE company_id = 1;
-- DELETE FROM companies WHERE id = 1; 