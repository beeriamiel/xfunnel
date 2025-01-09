-- Drop the existing view
DROP VIEW IF EXISTS persona_response_stats;

-- Recreate the view with security check
CREATE OR REPLACE VIEW persona_response_stats AS
SELECT 
    COUNT(DISTINCT r.id) FILTER (WHERE r.response_text IS NOT NULL) as questions_with_responses,
    MAX(r.created_at) as latest_response_date,
    p.title as persona_title,
    COUNT(DISTINCT r.response_batch_id) as total_batches,
    p.id as persona_id,
    COUNT(DISTINCT q.id) as total_questions
FROM personas p
LEFT JOIN queries q ON q.persona_id = p.id
LEFT JOIN responses r ON r.query_id = q.id
WHERE EXISTS (
    SELECT 1 FROM account_users au
    WHERE au.account_id = p.account_id
    AND au.user_id = auth.uid()
) OR EXISTS (
    SELECT 1 FROM auth.users
    WHERE users.id = auth.uid()
    AND ((users.raw_user_meta_data->>'is_super_admin')::boolean = true)
)
GROUP BY p.id, p.title; 