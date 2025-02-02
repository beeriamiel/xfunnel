##tables
| table_schema | table_name              | columns                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------ | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| auth         | audit_log_entries       | payload json,
    ip_address character varying(64) NOT NULL DEFAULT ''::character varying,
    created_at timestamp with time zone,
    id uuid NOT NULL,
    instance_id uuid                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| auth         | flow_state              | code_challenge_method USER-DEFINED NOT NULL,
    user_id uuid,
    code_challenge text NOT NULL,
    id uuid NOT NULL,
    authentication_method text NOT NULL,
    auth_code text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    provider_type text NOT NULL,
    auth_code_issued_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_at timestamp with time zone                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| auth         | identities              | id uuid NOT NULL DEFAULT gen_random_uuid(),
    provider_id text NOT NULL,
    updated_at timestamp with time zone,
    created_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    identity_data jsonb NOT NULL,
    user_id uuid NOT NULL,
    email text,
    provider text NOT NULL                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| auth         | instances               | raw_base_config text,
    uuid uuid,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    id uuid NOT NULL                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| auth         | mfa_amr_claims          | session_id uuid NOT NULL,
    authentication_method text NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    id uuid NOT NULL                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| auth         | mfa_challenges          | web_authn_session_data jsonb,
    otp_code text,
    verified_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    factor_id uuid NOT NULL,
    id uuid NOT NULL,
    ip_address inet NOT NULL                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| auth         | mfa_factors             | friendly_name text,
    status USER-DEFINED NOT NULL,
    phone text,
    created_at timestamp with time zone NOT NULL,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    updated_at timestamp with time zone NOT NULL,
    last_challenged_at timestamp with time zone,
    id uuid NOT NULL,
    secret text,
    user_id uuid NOT NULL,
    factor_type USER-DEFINED NOT NULL                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| auth         | one_time_tokens         | user_id uuid NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now(),
    relates_to text NOT NULL,
    token_hash text NOT NULL,
    id uuid NOT NULL,
    token_type USER-DEFINED NOT NULL                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| auth         | refresh_tokens          | id bigint NOT NULL DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass),
    instance_id uuid,
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    session_id uuid,
    user_id character varying(255),
    token character varying(255),
    parent character varying(255)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| auth         | saml_providers          | created_at timestamp with time zone,
    updated_at timestamp with time zone,
    entity_id text NOT NULL,
    name_id_format text,
    metadata_xml text NOT NULL,
    metadata_url text,
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    attribute_mapping jsonb                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| auth         | saml_relay_states       | for_email text,
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    request_id text NOT NULL,
    redirect_to text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| auth         | schema_migrations       | version character varying(255) NOT NULL                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| auth         | sessions                | not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    ip inet,
    user_agent text,
    id uuid NOT NULL,
    tag text,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal USER-DEFINED                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| auth         | sso_domains             | id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    domain text NOT NULL                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| auth         | sso_providers           | resource_id text,
    id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| auth         | users                   | is_anonymous boolean NOT NULL DEFAULT false,
    id uuid NOT NULL,
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_sent_at timestamp with time zone,
    recovery_sent_at timestamp with time zone,
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone_confirmed_at timestamp with time zone,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean NOT NULL DEFAULT false,
    deleted_at timestamp with time zone,
    email character varying(255),
    role character varying(255),
    aud character varying(255),
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change text DEFAULT ''::character varying,
    phone text DEFAULT NULL::character varying,
    email_change character varying(255),
    email_change_token_new character varying(255),
    recovery_token character varying(255),
    confirmation_token character varying(255),
    encrypted_password character varying(255),
    instance_id uuid |
| public       | account_users           | role text NOT NULL,
    user_id uuid NOT NULL,
    account_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    id uuid NOT NULL DEFAULT gen_random_uuid()                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| public       | accounts                | id uuid NOT NULL DEFAULT gen_random_uuid(),
    monthly_credits_available integer NOT NULL DEFAULT 0,
    monthly_credits_used integer NOT NULL DEFAULT 0,
    credits_renewal_date timestamp with time zone,
    last_update_date timestamp with time zone DEFAULT now(),
    name text NOT NULL,
    account_type text NOT NULL,
    plan_type text NOT NULL,
    created_at timestamp with time zone DEFAULT now()                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| public       | batch_metadata          | status text NOT NULL,
    error_message text,
    completed_at timestamp with time zone,
    account_id uuid,
    metadata jsonb,
    batch_id uuid NOT NULL,
    company_id bigint,
    batch_type text NOT NULL,
    created_at timestamp with time zone DEFAULT now()                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| public       | citations               | mentioned_companies_count ARRAY,
    content_scraped_at timestamp with time zone,
    content_analysis_updated_at timestamp with time zone,
    is_original boolean DEFAULT true,
    origin_citation_id bigint,
    account_id uuid,
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    citation_order integer NOT NULL,
    response_analysis_id bigint NOT NULL,
    company_id bigint NOT NULL,
    recommended boolean,
    company_mentioned boolean,
    ranking_position integer,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    domain_authority bigint,
    source_type USER-DEFINED NOT NULL DEFAULT 'EARNED'::citation_source_type,
    page_authority integer,
    spam_score integer,
    root_domains_to_root_domain integer,
    external_links_to_root_domain integer,
    moz_last_crawled timestamp with time zone,
    moz_last_updated timestamp with time zone,
    citation_url text NOT NULL,
    buyer_persona text,
    buyer_journey_phase text,
    rank_list text,
    mentioned_companies ARRAY,
    icp_vertical text,
    response_text text,
    region text,
    query_text text,
    content_analysis text,
    content_markdown text,
    content_scraping_error text                                                                                                                                                                                                                                                                                                                                                                                           |
| public       | companies               | account_id uuid,
    name text NOT NULL,
    product_category text,
    industry text,
    markets_operating_in ARRAY DEFAULT '{}'::text[],
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    main_products ARRAY DEFAULT '{}'::text[],
    number_of_employees integer,
    annual_revenue text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| public       | competitors             | created_at timestamp with time zone DEFAULT now(),
    company_id bigint NOT NULL,
    id bigint NOT NULL,
    competitor_name text NOT NULL                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| public       | generation_progress     | id bigint NOT NULL,
    progress integer NOT NULL,
    updated_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    status text NOT NULL,
    error_message text,
    company_id bigint NOT NULL                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| public       | ideal_customer_profiles | created_at timestamp with time zone DEFAULT now(),
    company_id bigint,
    icp_batch_id uuid DEFAULT gen_random_uuid(),
    created_by_batch boolean DEFAULT false,
    account_id uuid,
    vertical text NOT NULL,
    company_size text NOT NULL,
    region text NOT NULL,
    id bigint NOT NULL                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| public       | persona_response_stats  | questions_with_responses bigint,
    latest_response_date timestamp with time zone,
    persona_title text,
    total_batches bigint,
    persona_id bigint,
    total_questions bigint                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| public       | personas                | department text NOT NULL,
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    icp_id bigint,
    seniority_level text NOT NULL,
    title text NOT NULL,
    account_id uuid                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| public       | prompt_logs             | persona_id bigint,
    context_data jsonb,
    user_prompt text NOT NULL,
    system_prompt text NOT NULL,
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    company_id bigint,
    prompt_template_ids ARRAY NOT NULL                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| public       | prompts                 | prompt_type text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    name text NOT NULL,
    id bigint NOT NULL,
    prompt_text text NOT NULL,
    is_active boolean DEFAULT false                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| public       | queries                 | buyer_journey_phase ARRAY,
    created_at timestamp with time zone DEFAULT now(),
    company_id bigint,
    id bigint NOT NULL,
    prompt_id bigint,
    persona_id bigint,
    user_id uuid,
    query_batch_id uuid DEFAULT gen_random_uuid(),
    created_by_batch boolean DEFAULT false,
    account_id uuid,
    query_text text NOT NULL                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| public       | response_analysis       | query_id bigint,
    prompt_name text,
    company_name text NOT NULL,
    query_text text,
    answer_engine text NOT NULL,
    id bigint NOT NULL,
    response_id bigint,
    citations_parsed jsonb,
    recommended boolean,
    cited boolean,
    created_at timestamp with time zone DEFAULT now(),
    sentiment_score double precision,
    ranking_position integer,
    company_mentioned boolean DEFAULT false,
    company_id bigint NOT NULL,
    geographic_region text,
    prompt_id bigint,
    solution_analysis jsonb,
    analysis_batch_id uuid,
    created_by_batch boolean DEFAULT false,
    account_id uuid,
    buyer_persona text,
    buying_journey_stage text,
    industry_vertical text,
    response_text text,
    rank_list text,
    icp_vertical text,
    mentioned_companies ARRAY DEFAULT '{}'::text[],
    competitors_list ARRAY DEFAULT '{}'::text[]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| public       | response_analysis_view  | sentiment_score double precision,
    company_mentioned boolean,
    recommended boolean,
    citations_parsed jsonb,
    created_at timestamp with time zone,
    response_id bigint,
    buying_journey_stage text,
    geographic_region text,
    industry_vertical text,
    buyer_persona text,
    ranking_position integer,
    id bigint                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| public       | responses               | query_id bigint,
    response_text text NOT NULL,
    citations ARRAY,
    answer_engine text,
    created_at timestamp with time zone DEFAULT now(),
    url text,
    websearchqueries ARRAY,
    response_batch_id uuid DEFAULT gen_random_uuid(),
    account_id uuid,
    created_by_batch boolean DEFAULT false,
    id bigint NOT NULL                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
##indexes
| section  | table_schema | table_name              | indexes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------- | ------------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| INDEXES: | auth         | audit_log_entries       | CREATE UNIQUE INDEX audit_log_entries_pkey ON auth.audit_log_entries USING btree (id)
CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| INDEXES: | auth         | flow_state              | CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method)
CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC)
CREATE UNIQUE INDEX flow_state_pkey ON auth.flow_state USING btree (id)
CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| INDEXES: | auth         | identities              | CREATE UNIQUE INDEX identities_pkey ON auth.identities USING btree (id)
CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops)
CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id)
CREATE UNIQUE INDEX identities_provider_id_provider_unique ON auth.identities USING btree (provider_id, provider)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| INDEXES: | auth         | instances               | CREATE UNIQUE INDEX instances_pkey ON auth.instances USING btree (id)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| INDEXES: | auth         | mfa_amr_claims          | CREATE UNIQUE INDEX mfa_amr_claims_session_id_authentication_method_pkey ON auth.mfa_amr_claims USING btree (session_id, authentication_method)
CREATE UNIQUE INDEX amr_id_pk ON auth.mfa_amr_claims USING btree (id)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| INDEXES: | auth         | mfa_challenges          | CREATE UNIQUE INDEX mfa_challenges_pkey ON auth.mfa_challenges USING btree (id)
CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| INDEXES: | auth         | mfa_factors             | CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text)
CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at)
CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id)
CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone)
CREATE UNIQUE INDEX mfa_factors_last_challenged_at_key ON auth.mfa_factors USING btree (last_challenged_at)
CREATE UNIQUE INDEX mfa_factors_pkey ON auth.mfa_factors USING btree (id)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| INDEXES: | auth         | one_time_tokens         | CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to)
CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type)
CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash)
CREATE UNIQUE INDEX one_time_tokens_pkey ON auth.one_time_tokens USING btree (id)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| INDEXES: | auth         | refresh_tokens          | CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC)
CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked)
CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent)
CREATE UNIQUE INDEX refresh_tokens_token_unique ON auth.refresh_tokens USING btree (token)
CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id)
CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id)
CREATE UNIQUE INDEX refresh_tokens_pkey ON auth.refresh_tokens USING btree (id)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| INDEXES: | auth         | saml_providers          | CREATE UNIQUE INDEX saml_providers_entity_id_key ON auth.saml_providers USING btree (entity_id)
CREATE UNIQUE INDEX saml_providers_pkey ON auth.saml_providers USING btree (id)
CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| INDEXES: | auth         | saml_relay_states       | CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC)
CREATE UNIQUE INDEX saml_relay_states_pkey ON auth.saml_relay_states USING btree (id)
CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email)
CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| INDEXES: | auth         | schema_migrations       | CREATE UNIQUE INDEX schema_migrations_pkey ON auth.schema_migrations USING btree (version)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| INDEXES: | auth         | sessions                | CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at)
CREATE UNIQUE INDEX sessions_pkey ON auth.sessions USING btree (id)
CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id)
CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| INDEXES: | auth         | sso_domains             | CREATE UNIQUE INDEX sso_domains_pkey ON auth.sso_domains USING btree (id)
CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id)
CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain))                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| INDEXES: | auth         | sso_providers           | CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id))
CREATE UNIQUE INDEX sso_providers_pkey ON auth.sso_providers USING btree (id)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| INDEXES: | auth         | users                   | CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id)
CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false)
CREATE UNIQUE INDEX users_phone_key ON auth.users USING btree (phone)
CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous)
CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text)
CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text))
CREATE UNIQUE INDEX users_pkey ON auth.users USING btree (id)
CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text)
CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text)
CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text)
CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text)                                                    |
| INDEXES: | public       | batch_metadata          | CREATE INDEX idx_batch_metadata_type ON public.batch_metadata USING btree (batch_type)
CREATE INDEX idx_batch_metadata_company ON public.batch_metadata USING btree (company_id)
CREATE UNIQUE INDEX batch_metadata_pkey ON public.batch_metadata USING btree (batch_id)
CREATE INDEX idx_batch_metadata_status ON public.batch_metadata USING btree (status)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| INDEXES: | public       | citations               | CREATE INDEX idx_citations_citation_order ON public.citations USING btree (citation_order)
CREATE INDEX idx_citations_created_at ON public.citations USING btree (created_at DESC)
CREATE INDEX idx_citations_moz_last_updated ON public.citations USING btree (moz_last_updated)
CREATE INDEX idx_citations_response_analysis_id ON public.citations USING btree (response_analysis_id)
CREATE INDEX idx_citations_company_id ON public.citations USING btree (company_id)
CREATE UNIQUE INDEX citations_pkey ON public.citations USING btree (id)
CREATE INDEX idx_citations_source_type ON public.citations USING btree (source_type)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| INDEXES: | public       | companies               | CREATE INDEX idx_companies_number_of_employees ON public.companies USING btree (number_of_employees)
CREATE UNIQUE INDEX companies_pkey ON public.companies USING btree (id)
CREATE INDEX idx_companies_product_category ON public.companies USING btree (product_category)
CREATE INDEX idx_companies_main_products ON public.companies USING gin (main_products)
CREATE INDEX idx_companies_markets ON public.companies USING gin (markets_operating_in)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| INDEXES: | public       | competitors             | CREATE UNIQUE INDEX competitors_pkey ON public.competitors USING btree (id)
CREATE INDEX idx_competitors_company_id ON public.competitors USING btree (company_id)
CREATE UNIQUE INDEX unique_competitor_per_company ON public.competitors USING btree (company_id, competitor_name)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| INDEXES: | public       | generation_progress     | CREATE INDEX idx_generation_progress_status ON public.generation_progress USING btree (status)
CREATE UNIQUE INDEX generation_progress_pkey ON public.generation_progress USING btree (id)
CREATE INDEX idx_generation_progress_company_id ON public.generation_progress USING btree (company_id)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| INDEXES: | public       | ideal_customer_profiles | CREATE UNIQUE INDEX ideal_customer_profiles_pkey ON public.ideal_customer_profiles USING btree (id)
CREATE UNIQUE INDEX unique_icp_batch_id ON public.ideal_customer_profiles USING btree (icp_batch_id)
CREATE INDEX idx_icp_batch_id ON public.ideal_customer_profiles USING btree (icp_batch_id)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| INDEXES: | public       | personas                | CREATE INDEX idx_personas_icp_id ON public.personas USING btree (icp_id)
CREATE UNIQUE INDEX personas_pkey ON public.personas USING btree (id)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| INDEXES: | public       | prompt_logs             | CREATE INDEX idx_prompt_logs_persona ON public.prompt_logs USING btree (persona_id)
CREATE UNIQUE INDEX prompt_logs_pkey ON public.prompt_logs USING btree (id)
CREATE INDEX idx_prompt_logs_company ON public.prompt_logs USING btree (company_id)
CREATE INDEX idx_prompt_logs_created_at ON public.prompt_logs USING btree (created_at)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| INDEXES: | public       | prompts                 | CREATE INDEX idx_prompts_is_active ON public.prompts USING btree (is_active)
CREATE UNIQUE INDEX prompts_pkey ON public.prompts USING btree (id)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| INDEXES: | public       | queries                 | CREATE UNIQUE INDEX queries_pkey ON public.queries USING btree (id)
CREATE INDEX idx_queries_company_id ON public.queries USING btree (company_id)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| INDEXES: | public       | response_analysis       | CREATE INDEX idx_response_analysis_prompt_name ON public.response_analysis USING btree (prompt_name)
CREATE INDEX idx_response_analysis_prompt ON public.response_analysis USING btree (prompt_id, created_at)
CREATE INDEX idx_response_analysis_metrics ON public.response_analysis USING btree (sentiment_score, ranking_position, company_mentioned, recommended)
CREATE INDEX idx_response_analysis_groups ON public.response_analysis USING btree (geographic_region, industry_vertical, buyer_persona, buying_journey_stage)
CREATE INDEX idx_response_analysis_company_name ON public.response_analysis USING btree (company_name)
CREATE INDEX idx_response_analysis_response_id ON public.response_analysis USING btree (response_id)
CREATE INDEX idx_response_analysis_batch ON public.response_analysis USING btree (analysis_batch_id)
CREATE INDEX idx_response_analysis_company_id ON public.response_analysis USING btree (company_id)
CREATE INDEX idx_response_analysis_answer_engine ON public.response_analysis USING btree (answer_engine)
CREATE INDEX idx_response_analysis_query_id ON public.response_analysis USING btree (query_id)
CREATE UNIQUE INDEX response_analysis_pkey ON public.response_analysis USING btree (id)
CREATE INDEX idx_response_analysis_solution ON public.response_analysis USING gin (solution_analysis) |
| INDEXES: | public       | responses               | CREATE UNIQUE INDEX responses_pkey ON public.responses USING btree (id)
CREATE INDEX idx_responses_query_id ON public.responses USING btree (query_id)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

##triggers
| section            | table_schema | table_name          | check_constraints                                                                                                                                                                                                                                                                                      |
| ------------------ | ------------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CHECK CONSTRAINTS: | auth         | one_time_tokens     | one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))                                                                                                                                                                                                                                 |
| CHECK CONSTRAINTS: | auth         | saml_providers      | entity_id not empty CHECK ((char_length(entity_id) > 0))
metadata_url not empty CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0)))
metadata_xml not empty CHECK ((char_length(metadata_xml) > 0))                                                                                |
| CHECK CONSTRAINTS: | auth         | saml_relay_states   | request_id not empty CHECK ((char_length(request_id) > 0))                                                                                                                                                                                                                                             |
| CHECK CONSTRAINTS: | auth         | sso_domains         | domain not empty CHECK ((char_length(domain) > 0))                                                                                                                                                                                                                                                     |
| CHECK CONSTRAINTS: | auth         | sso_providers       | resource_id not empty CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))                                                                                                                                                                                                           |
| CHECK CONSTRAINTS: | auth         | users               | users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))                                                                                                                                                                            |
| CHECK CONSTRAINTS: | public       | batch_metadata      | batch_metadata_batch_type_check CHECK ((batch_type = ANY (ARRAY['icp'::text, 'query'::text, 'response'::text, 'response_analysis'::text, 'citations_moz'::text])))
batch_metadata_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text, 'failed'::text]))) |
| CHECK CONSTRAINTS: | public       | companies           | valid_markets CHECK ((markets_operating_in <@ ARRAY['north_america'::text, 'europe'::text, 'asia_pacific'::text, 'middle_east'::text, 'latin_america'::text]))                                                                                                                                         |
| CHECK CONSTRAINTS: | public       | generation_progress | generation_progress_progress_check CHECK (((progress >= 0) AND (progress <= 100)))
generation_progress_status_check CHECK ((status = ANY (ARRAY['generating_icps'::text, 'generating_questions'::text, 'complete'::text, 'failed'::text])))                                                            |
| CHECK CONSTRAINTS: | public       | queries             | queries_buyer_journey_phase_check CHECK (((array_length(buyer_journey_phase, 1) = 1) AND (buyer_journey_phase <@ ARRAY['problem_exploration'::text, 'solution_education'::text, 'solution_comparison'::text, 'solution_evaluation'::text, 'final_research'::text])))                                   |
| CHECK CONSTRAINTS: | public       | responses           | responses_answer_engine_check CHECK ((answer_engine = ANY (ARRAY['openai'::text, 'gemini'::text, 'perplexity'::text, 'claude'::text, 'google_search'::text, 'llama'::text])))                                                                                                                          |INTS: | public       | responses           | responses_answer_engine_check CHECK ((answer_engine = ANY (ARRAY['openai'::text, 'gemini'::text, 'perplexity'::text, 'claude'::text, 'google_search'::text, 'llama'::text])))                                                                                                   |

##rls Policies

| schema_name | table_name              | policy_name                                  | permissive | roles         | command | using_expression                                                                                                                                                     | with_check_expression                                                                                                                                                |
| ----------- | ----------------------- | -------------------------------------------- | ---------- | ------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| public      | account_users           | admin_account_access                         | PERMISSIVE | authenticated | ALL     | ((user_id = auth.uid()) AND (role = 'admin'::text))                                                                                                                  |                                                                                                                                                                      |
| public      | account_users           | superadmin_access                            | PERMISSIVE | authenticated | ALL     | (EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = auth.uid()) AND ((users.raw_user_meta_data ->> 'is_super_admin'::text) = 'true'::text))))                 |                                                                                                                                                                      |
| public      | account_users           | user_account_access                          | PERMISSIVE | authenticated | SELECT  | (user_id = auth.uid())                                                                                                                                               |                                                                                                                                                                      |
| public      | accounts                | Users can view their accounts                | PERMISSIVE |               | SELECT  | (EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.account_id = accounts.id) AND (account_users.user_id = auth.uid()))))                               |                                                                                                                                                                      |
| public      | accounts                | super_admin_policy                           | PERMISSIVE | authenticated | ALL     | (EXISTS ( SELECT 1
   FROM auth.users
  WHERE (((users.email)::text = CURRENT_USER) AND (((users.raw_user_meta_data ->> 'is_super_admin'::text))::boolean = true)))) | (EXISTS ( SELECT 1
   FROM auth.users
  WHERE (((users.email)::text = CURRENT_USER) AND (((users.raw_user_meta_data ->> 'is_super_admin'::text))::boolean = true)))) |
| public      | batch_metadata          | Users can access their account's batches     | PERMISSIVE |               | ALL     | (EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.account_id = batch_metadata.account_id) AND (account_users.user_id = auth.uid()))))                 |                                                                                                                                                                      |
| public      | batch_metadata          | super_admin_policy                           | PERMISSIVE | authenticated | ALL     | (EXISTS ( SELECT 1
   FROM auth.users
  WHERE (((users.email)::text = CURRENT_USER) AND (((users.raw_user_meta_data ->> 'is_super_admin'::text))::boolean = true)))) | (EXISTS ( SELECT 1
   FROM auth.users
  WHERE (((users.email)::text = CURRENT_USER) AND (((users.raw_user_meta_data ->> 'is_super_admin'::text))::boolean = true)))) |
| public      | citations               | Enable insert for authenticated users        | PERMISSIVE | authenticated | INSERT  |                                                                                                                                                                      | true                                                                                                                                                                 |
| public      | citations               | Enable read access for authenticated users   | PERMISSIVE | authenticated | SELECT  | true                                                                                                                                                                 |                                                                                                                                                                      |
| public      | citations               | Enable update for authenticated users        | PERMISSIVE | authenticated | UPDATE  | true                                                                                                                                                                 | true                                                                                                                                                                 |
| public      | citations               | Users can create citations in their accounts | PERMISSIVE |               | INSERT  |                                                                                                                                                                      | (EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.account_id = citations.account_id) AND (account_users.user_id = auth.uid()))))                      |
| public      | citations               | Users can view their account's citations     | PERMISSIVE |               | SELECT  | (EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.account_id = citations.account_id) AND (account_users.user_id = auth.uid()))))                      |                                                                                                                                                                      |
| public      | citations               | super_admin_policy                           | PERMISSIVE | authenticated | ALL     | (EXISTS ( SELECT 1
   FROM auth.users
  WHERE (((users.email)::text = CURRENT_USER) AND (((users.raw_user_meta_data ->> 'is_super_admin'::text))::boolean = true)))) | (EXISTS ( SELECT 1
   FROM auth.users
  WHERE (((users.email)::text = CURRENT_USER) AND (((users.raw_user_meta_data ->> 'is_super_admin'::text))::boolean = true)))) |
| public      | companies               | Enable read access for all users             | PERMISSIVE |               | SELECT  | true                                                                                                                                                                 |                                                                                                                                                                      |
| public      | companies               | Users can access their account's companies   | PERMISSIVE |               | ALL     | (EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.account_id = companies.account_id) AND (account_users.user_id = auth.uid()))))                      |                                                                                                                                                                      |
| public      | companies               | Users can create companies in their accounts | PERMISSIVE |               | INSERT  |                                                                                                                                                                      | (EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.account_id = companies.account_id) AND (account_users.user_id = auth.uid()))))                      |
| public      | companies               | Users can insert companies                   | PERMISSIVE | authenticated | INSERT  |                                                                                                                                                                      | true                                                                                                                                                                 |
| public      | companies               | Users can view their account's companies     | PERMISSIVE |               | SELECT  | (EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.account_id = companies.account_id) AND (account_users.user_id = auth.uid()))))                      |                                                                                                                                                                      |
| public      | companies               | super_admin_policy                           | PERMISSIVE | authenticated | ALL     | (EXISTS ( SELECT 1
   FROM auth.users
  WHERE (((users.email)::text = CURRENT_USER) AND (((users.raw_user_meta_data ->> 'is_super_admin'::text))::boolean = true)))) | (EXISTS ( SELECT 1
   FROM auth.users
  WHERE (((users.email)::text = CURRENT_USER) AND (((users.raw_user_meta_data ->> 'is_super_admin'::text))::boolean = true)))) |
| public      | competitors             | super_admin_policy                           | PERMISSIVE | authenticated | ALL     | (EXISTS ( SELECT 1
   FROM auth.users
  WHERE (((users.email)::text = CURRENT_USER) AND (((users.raw_user_meta_data ->> 'is_super_admin'::text))::boolean = true)))) | (EXISTS ( SELECT 1
   FROM auth.users
  WHERE (((users.email)::text = CURRENT_USER) AND (((users.raw_user_meta_data ->> 'is_super_admin'::text))::boolean = true)))) |
| public      | generation_progress     | Enable read access for all users             | PERMISSIVE |               | SELECT  | true                                                                                                                                                                 |                                                                                                                                                                      |
| public      | generation_progress     | super_admin_policy                           | PERMISSIVE | authenticated | ALL     | (EXISTS ( SELECT 1
   FROM auth.users
  WHERE (((users.email)::text = CURRENT_USER) AND (((users.raw_user_meta_data ->> 'is_super_admin'::text))::boolean = true)))) | (EXISTS ( SELECT 1
   FROM auth.users
  WHERE (((users.email)::text = CURRENT_USER) AND (((users.raw_user_meta_data ->> 'is_super_admin'::text))::boolean = true)))) |
| public      | ideal_customer_profiles | Enable insert access for authenticated users | PERMISSIVE |               | INSERT  |                                                                                                                                                                      | true                                                                                                                                                                 |
| public      | ideal_customer_profiles | Enable read access for all users             | PERMISSIVE |               | SELECT  | true                                                                                                                                                                 |                                                                                                                                                                      |
| public      | ideal_customer_profiles | Users can create ICPs in their accounts      | PERMISSIVE |               | INSERT  |                                                                                                                                                                      | (EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.account_id = ideal_customer_profiles.account_id) AND (account_users.user_id = auth.uid()))))        |
| public      | ideal_customer_profiles | Users can view their account's ICPs          | PERMISSIVE |               | SELECT  | (EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.account_id = ideal_customer_profiles.account_id) AND (account_users.user_id = auth.uid()))))        |                                                                                                                                                                      |
| public      | ideal_customer_profiles | super_admin_policy                           | PERMISSIVE | authenticated | ALL     | (EXISTS ( SELECT 1
   FROM auth.users
  WHERE (((users.email)::text = CURRENT_USER) AND (((users.raw_user_meta_data ->> 'is_super_admin'::text))::boolean = true)))) | (EXISTS ( SELECT 1
   FROM auth.users
  WHERE (((users.email)::text = CURRENT_USER) AND (((users.raw_user_meta_data ->> 'is_super_admin'::text))::boolean = true)))) |
| public      | personas                | Enable insert access for authenticated users | PERMISSIVE |               | INSERT  |                                                                                                                                                                      | true                                                                                                                                                                 |
| public      | personas                | Enable read access for all users             | PERMISSIVE |               | SELECT  | true                                                                                                                                                                 |                                                                                                                                                                      |
| public      | personas                | Users can create personas in their accounts  | PERMISSIVE |               | INSERT  |                                                                                                                                                                      | (EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.account_id = personas.account_id) AND (account_users.user_id = auth.uid()))))                       |
| public      | personas                | Users can view their account's personas      | PERMISSIVE |               | SELECT  | (EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.account_id = personas.account_id) AND (account_users.user_id = auth.uid()))))                       |                                                                                                                                                                      |
| public      | personas                | super_admin_policy                           | PERMISSIVE | authenticated | ALL     | (EXISTS ( SELECT 1
   FROM auth.users
  WHERE (((users.email)::text = CURRENT_USER) AND (((users.raw_user_meta_data ->> 'is_super_admin'::text))::boolean = true)))) | (EXISTS ( SELECT 1
   FROM auth.users
  WHERE (((users.email)::text = CURRENT_USER) AND (((users.raw_user_meta_data ->> 'is_super_admin'::text))::boolean = true)))) |
| public      | prompt_logs             | super_admin_policy                           | PERMISSIVE | authenticated | ALL     | (EXISTS ( SELECT 1
   FROM auth.users
  WHERE (((users.email)::text = CURRENT_USER) AND (((users.raw_user_meta_data ->> 'is_super_admin'::text))::boolean = true)))) | (EXISTS ( SELECT 1
   FROM auth.users
  WHERE (((users.email)::text = CURRENT_USER) AND (((users.raw_user_meta_data ->> 'is_super_admin'::text))::boolean = true)))) |
| public      | prompts                 | Allow reading prompts                        | PERMISSIVE |               | SELECT  | true                                                                                                                                                                 |                                                                                                                                                                      |
| public      | prompts                 | Authenticated users can manage prompts       | PERMISSIVE | authenticated | ALL     | true                                                                                                                                                                 | true                                                                                                                                                                 |
| public      | prompts                 | super_admin_policy                           | PERMISSIVE | authenticated | ALL     | (EXISTS ( SELECT 1
   FROM auth.users
  WHERE (((users.email)::text = CURRENT_USER) AND (((users.raw_user_meta_data ->> 'is_super_admin'::text))::boolean = true)))) | (EXISTS ( SELECT 1
   FROM auth.users
  WHERE (((users.email)::text = CURRENT_USER) AND (((users.raw_user_meta_data ->> 'is_super_admin'::text))::boolean = true)))) |
| public      | queries                 | Allow reading queries                        | PERMISSIVE |               | SELECT  | true                                                                                                                                                                 |                                                                                                                                                                      |
| public      | queries                 | Users can create queries in their accounts   | PERMISSIVE |               | INSERT  |                                                                                                                                                                      | (EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.account_id = queries.account_id) AND (account_users.user_id = auth.uid()))))                        |
| public      | queries                 | Users can insert their own data              | PERMISSIVE |               | INSERT  |                                                                                                                                                                      | (user_id = auth.uid())                                                                                                                                               |
| public      | queries                 | Users can update their own queries           | PERMISSIVE |               | UPDATE  | (user_id = auth.uid())                                                                                                                                               | (user_id = auth.uid())                                                                                                                                               |
| public      | queries                 | Users can view their account's queries       | PERMISSIVE |               | SELECT  | (EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.account_id = queries.account_id) AND (account_users.user_id = auth.uid()))))                        |                                                                                                                                                                      |
| public      | queries                 | super_admin_policy                           | PERMISSIVE | authenticated | ALL     | (EXISTS ( SELECT 1
   FROM auth.users
  WHERE (((users.email)::text = CURRENT_USER) AND (((users.raw_user_meta_data ->> 'is_super_admin'::text))::boolean = true)))) | (EXISTS ( SELECT 1
   FROM auth.users
  WHERE (((users.email)::text = CURRENT_USER) AND (((users.raw_user_meta_data ->> 'is_super_admin'::text))::boolean = true)))) |
| public      | response_analysis       | Allow viewing all response analyses          | PERMISSIVE |               | ALL     | true                                                                                                                                                                 |                                                                                                                                                                      |
| public      | response_analysis       | Users can create analyses in their accounts  | PERMISSIVE |               | INSERT  |                                                                                                                                                                      | (EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.account_id = response_analysis.account_id) AND (account_users.user_id = auth.uid()))))              |
| public      | response_analysis       | Users can view their account's analyses      | PERMISSIVE |               | SELECT  | (EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.account_id = response_analysis.account_id) AND (account_users.user_id = auth.uid()))))              |                                                                                                                                                                      |
| public      | response_analysis       | super_admin_policy                           | PERMISSIVE | authenticated | ALL     | (EXISTS ( SELECT 1
   FROM auth.users
  WHERE (((users.email)::text = CURRENT_USER) AND (((users.raw_user_meta_data ->> 'is_super_admin'::text))::boolean = true)))) | (EXISTS ( SELECT 1
   FROM auth.users
  WHERE (((users.email)::text = CURRENT_USER) AND (((users.raw_user_meta_data ->> 'is_super_admin'::text))::boolean = true)))) |
| public      | responses               | Enable insert for authenticated users        | PERMISSIVE |               | INSERT  |                                                                                                                                                                      | (auth.role() = 'authenticated'::text)                                                                                                                                |
| public      | responses               | Enable read access for all users             | PERMISSIVE |               | SELECT  | true                                                                                                                                                                 |                                                                                                                                                                      |
| public      | responses               | Users can create responses in their accounts | PERMISSIVE |               | INSERT  |                                                                                                                                                                      | (EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.account_id = responses.account_id) AND (account_users.user_id = auth.uid()))))                      |
| public      | responses               | Users can update their account's responses   | PERMISSIVE |               | UPDATE  | (EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.account_id = responses.account_id) AND (account_users.user_id = auth.uid()))))                      |                                                                                                                                                                      |
| public      | responses               | Users can view responses to their queries    | PERMISSIVE |               | ALL     | (EXISTS ( SELECT 1
   FROM queries
  WHERE ((queries.id = responses.query_id) AND (queries.user_id = auth.uid()))))                                                  |                                                                                                                                                                      |
| public      | responses               | Users can view their account's responses     | PERMISSIVE |               | SELECT  | (EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.account_id = responses.account_id) AND (account_users.user_id = auth.uid()))))                      |                                                                                                                                                                      |
| public      | responses               | super_admin_policy                           | PERMISSIVE | authenticated | ALL     | (EXISTS ( SELECT 1
   FROM auth.users
  WHERE (((users.email)::text = CURRENT_USER) AND (((users.raw_user_meta_data ->> 'is_super_admin'::text))::boolean = true)))) | (EXISTS ( SELECT 1
   FROM auth.users
  WHERE (((users.email)::text = CURRENT_USER) AND (((users.raw_user_meta_data ->> 'is_super_admin'::text))::boolean = true)))) |

-- Add product_id column to ideal_customer_profiles
ALTER TABLE public.ideal_customer_profiles
ADD COLUMN product_id bigint;

-- Add foreign key constraint
ALTER TABLE public.ideal_customer_profiles
ADD CONSTRAINT fk_icp_product
FOREIGN KEY (product_id)
REFERENCES public.products(id)
ON DELETE SET NULL;

-- Add index for product_id
CREATE INDEX idx_icp_product_id ON public.ideal_customer_profiles(product_id);

-- Update RLS policies to include product filtering
ALTER POLICY "Users can create ICPs in their accounts" ON public.ideal_customer_profiles
USING (
  EXISTS (
    SELECT 1
    FROM account_users
    WHERE account_users.account_id = ideal_customer_profiles.account_id
    AND account_users.user_id = auth.uid()
  )
  AND (
    product_id IS NULL OR EXISTS (
      SELECT 1
      FROM products
      WHERE products.id = ideal_customer_profiles.product_id
      AND products.account_id = ideal_customer_profiles.account_id
    )
  )
);

ALTER POLICY "Users can view their account's ICPs" ON public.ideal_customer_profiles
USING (
  EXISTS (
    SELECT 1
    FROM account_users
    WHERE account_users.account_id = ideal_customer_profiles.account_id
    AND account_users.user_id = auth.uid()
  )
  AND (
    product_id IS NULL OR EXISTS (
      SELECT 1
      FROM products
      WHERE products.id = ideal_customer_profiles.product_id
      AND products.account_id = ideal_customer_profiles.account_id
    )
  )
);

-- Add setup_completed_at column to companies table
ALTER TABLE public.companies 
ADD COLUMN setup_completed_at timestamp with time zone;

-- Create index for setup_completed_at
CREATE INDEX idx_companies_setup_completed ON public.companies(setup_completed_at);

-- Update existing companies that have completed setup (have ICPs with personas)
UPDATE public.companies c
SET setup_completed_at = (
  SELECT MIN(icp.created_at)
  FROM public.ideal_customer_profiles icp
  INNER JOIN public.personas p ON p.icp_id = icp.id
  WHERE icp.company_id = c.id
  GROUP BY icp.company_id
)
WHERE EXISTS (
  SELECT 1
  FROM public.ideal_customer_profiles icp
  INNER JOIN public.personas p ON p.icp_id = icp.id
  WHERE icp.company_id = c.id
);