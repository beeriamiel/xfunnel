-- Enable RLS on tables that need it
ALTER TABLE generation_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_logs ENABLE ROW LEVEL SECURITY;

-- Generation Progress Policies
CREATE POLICY "Users can view their account's generation progress" ON generation_progress
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM companies 
    WHERE companies.id = generation_progress.company_id
    AND EXISTS (
      SELECT 1 FROM account_users
      WHERE account_users.account_id = companies.account_id
      AND account_users.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update their account's generation progress" ON generation_progress
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM companies 
    WHERE companies.id = generation_progress.company_id
    AND EXISTS (
      SELECT 1 FROM account_users
      WHERE account_users.account_id = companies.account_id
      AND account_users.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can insert generation progress for their account" ON generation_progress
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM companies 
    WHERE companies.id = generation_progress.company_id
    AND EXISTS (
      SELECT 1 FROM account_users
      WHERE account_users.account_id = companies.account_id
      AND account_users.user_id = auth.uid()
    )
  )
);

-- Prompt Logs Policies
CREATE POLICY "Users can view their account's prompt logs" ON prompt_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM companies 
    WHERE companies.id = prompt_logs.company_id
    AND EXISTS (
      SELECT 1 FROM account_users
      WHERE account_users.account_id = companies.account_id
      AND account_users.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can insert prompt logs for their account" ON prompt_logs
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM companies 
    WHERE companies.id = prompt_logs.company_id
    AND EXISTS (
      SELECT 1 FROM account_users
      WHERE account_users.account_id = companies.account_id
      AND account_users.user_id = auth.uid()
    )
  )
);

-- Super Admin Policies
CREATE POLICY "super_admin_policy" ON generation_progress
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE users.id = auth.uid()
    AND ((users.raw_user_meta_data->>'is_super_admin')::boolean = true)
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE users.id = auth.uid()
    AND ((users.raw_user_meta_data->>'is_super_admin')::boolean = true)
  )
);

CREATE POLICY "super_admin_policy" ON prompt_logs
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE users.id = auth.uid()
    AND ((users.raw_user_meta_data->>'is_super_admin')::boolean = true)
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE users.id = auth.uid()
    AND ((users.raw_user_meta_data->>'is_super_admin')::boolean = true)
  )
); 