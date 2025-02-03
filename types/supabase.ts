export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      account_users: {
        Row: {
          account_id: string
          created_at: string | null
          id: string
          role: string
          user_id: string
          user_name: string | null
        }
        Insert: {
          account_id: string
          created_at?: string | null
          id?: string
          role: string
          user_id: string
          user_name?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "account_users_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          account_type: string
          created_at: string | null
          credits_renewal_date: string | null
          id: string
          last_update_date: string | null
          monthly_credits_available: number
          monthly_credits_used: number
          name: string
          plan_type: string
        }
        Insert: {
          account_type: string
          created_at?: string | null
          credits_renewal_date?: string | null
          id?: string
          last_update_date?: string | null
          monthly_credits_available?: number
          monthly_credits_used?: number
          name: string
          plan_type: string
        }
        Update: {
          account_type?: string
          created_at?: string | null
          credits_renewal_date?: string | null
          id?: string
          last_update_date?: string | null
          monthly_credits_available?: number
          monthly_credits_used?: number
          name?: string
          plan_type?: string
        }
        Relationships: []
      }
      batch_metadata: {
        Row: {
          account_id: string | null
          batch_id: string
          batch_type: string
          company_id: number | null
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          metadata: Json | null
          status: string
        }
        Insert: {
          account_id?: string | null
          batch_id: string
          batch_type: string
          company_id?: number | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          metadata?: Json | null
          status: string
        }
        Update: {
          account_id?: string | null
          batch_id?: string
          batch_type?: string
          company_id?: number | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          metadata?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "batch_metadata_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_metadata_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      citations: {
        Row: {
          account_id: string | null
          buyer_journey_phase: string | null
          buyer_persona: string | null
          citation_order: number
          citation_url: string
          company_id: number
          company_mentioned: boolean | null
          content_analysis: string | null
          content_analysis_updated_at: string | null
          content_markdown: string | null
          content_scraped_at: string | null
          content_scraping_error: string | null
          created_at: string | null
          domain_authority: number | null
          external_links_to_root_domain: number | null
          icp_vertical: string | null
          id: number
          is_original: boolean | null
          mentioned_companies: string[] | null
          mentioned_companies_count: string[] | null
          moz_last_crawled: string | null
          moz_last_updated: string | null
          origin_citation_id: number | null
          page_authority: number | null
          query_text: string | null
          rank_list: string | null
          ranking_position: number | null
          recommended: boolean | null
          region: string | null
          response_analysis_id: number
          response_text: string | null
          root_domains_to_root_domain: number | null
          source_type: Database["public"]["Enums"]["citation_source_type"]
          spam_score: number | null
          updated_at: string | null
        }
        Insert: {
          account_id?: string | null
          buyer_journey_phase?: string | null
          buyer_persona?: string | null
          citation_order: number
          citation_url: string
          company_id: number
          company_mentioned?: boolean | null
          content_analysis?: string | null
          content_analysis_updated_at?: string | null
          content_markdown?: string | null
          content_scraped_at?: string | null
          content_scraping_error?: string | null
          created_at?: string | null
          domain_authority?: number | null
          external_links_to_root_domain?: number | null
          icp_vertical?: string | null
          id?: never
          is_original?: boolean | null
          mentioned_companies?: string[] | null
          mentioned_companies_count?: string[] | null
          moz_last_crawled?: string | null
          moz_last_updated?: string | null
          origin_citation_id?: number | null
          page_authority?: number | null
          query_text?: string | null
          rank_list?: string | null
          ranking_position?: number | null
          recommended?: boolean | null
          region?: string | null
          response_analysis_id: number
          response_text?: string | null
          root_domains_to_root_domain?: number | null
          source_type?: Database["public"]["Enums"]["citation_source_type"]
          spam_score?: number | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string | null
          buyer_journey_phase?: string | null
          buyer_persona?: string | null
          citation_order?: number
          citation_url?: string
          company_id?: number
          company_mentioned?: boolean | null
          content_analysis?: string | null
          content_analysis_updated_at?: string | null
          content_markdown?: string | null
          content_scraped_at?: string | null
          content_scraping_error?: string | null
          created_at?: string | null
          domain_authority?: number | null
          external_links_to_root_domain?: number | null
          icp_vertical?: string | null
          id?: never
          is_original?: boolean | null
          mentioned_companies?: string[] | null
          mentioned_companies_count?: string[] | null
          moz_last_crawled?: string | null
          moz_last_updated?: string | null
          origin_citation_id?: number | null
          page_authority?: number | null
          query_text?: string | null
          rank_list?: string | null
          ranking_position?: number | null
          recommended?: boolean | null
          region?: string | null
          response_analysis_id?: number
          response_text?: string | null
          root_domains_to_root_domain?: number | null
          source_type?: Database["public"]["Enums"]["citation_source_type"]
          spam_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "citations_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citations_origin_citation_id_fkey"
            columns: ["origin_citation_id"]
            isOneToOne: false
            referencedRelation: "citations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_origin_citation"
            columns: ["origin_citation_id"]
            isOneToOne: false
            referencedRelation: "citations"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          account_id: string | null
          annual_revenue: string | null
          created_at: string | null
          id: number
          industry: string | null
          main_products: string[] | null
          markets_operating_in: string[] | null
          name: string
          number_of_employees: number | null
          product_category: string | null
        }
        Insert: {
          account_id?: string | null
          annual_revenue?: string | null
          created_at?: string | null
          id?: never
          industry?: string | null
          main_products?: string[] | null
          markets_operating_in?: string[] | null
          name: string
          number_of_employees?: number | null
          product_category?: string | null
        }
        Update: {
          account_id?: string | null
          annual_revenue?: string | null
          created_at?: string | null
          id?: never
          industry?: string | null
          main_products?: string[] | null
          markets_operating_in?: string[] | null
          name?: string
          number_of_employees?: number | null
          product_category?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      competitors: {
        Row: {
          company_id: number
          competitor_name: string
          created_at: string | null
          id: number
        }
        Insert: {
          company_id: number
          competitor_name: string
          created_at?: string | null
          id?: number
        }
        Update: {
          company_id?: number
          competitor_name?: string
          created_at?: string | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "competitors_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      generation_progress: {
        Row: {
          company_id: number
          created_at: string | null
          error_message: string | null
          id: number
          progress: number
          status: string
          updated_at: string | null
        }
        Insert: {
          company_id: number
          created_at?: string | null
          error_message?: string | null
          id?: never
          progress: number
          status: string
          updated_at?: string | null
        }
        Update: {
          company_id?: number
          created_at?: string | null
          error_message?: string | null
          id?: never
          progress?: number
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generation_progress_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      ideal_customer_profiles: {
        Row: {
          account_id: string | null
          company_id: number | null
          company_size: string
          created_at: string | null
          created_by_batch: boolean | null
          icp_batch_id: string | null
          id: number
          region: string
          vertical: string
          product_id: number | null
        }
        Insert: {
          account_id?: string | null
          company_id?: number | null
          company_size: string
          created_at?: string | null
          created_by_batch?: boolean | null
          icp_batch_id?: string | null
          id?: number
          region: string
          vertical: string
          product_id?: number | null
        }
        Update: {
          account_id?: string | null
          company_id?: number | null
          company_size?: string
          created_at?: string | null
          created_by_batch?: boolean | null
          icp_batch_id?: string | null
          id?: number
          region?: string
          vertical?: string
          product_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_icp_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ideal_customer_profiles_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ideal_customer_profiles_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      personas: {
        Row: {
          account_id: string | null
          created_at: string | null
          department: string
          icp_id: number | null
          id: number
          seniority_level: string
          title: string
        }
        Insert: {
          account_id?: string | null
          created_at?: string | null
          department: string
          icp_id?: number | null
          id?: number
          seniority_level: string
          title: string
        }
        Update: {
          account_id?: string | null
          created_at?: string | null
          department?: string
          icp_id?: number | null
          id?: number
          seniority_level?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_personas_icp"
            columns: ["icp_id"]
            isOneToOne: false
            referencedRelation: "ideal_customer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personas_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_logs: {
        Row: {
          company_id: number | null
          context_data: Json | null
          created_at: string | null
          id: number
          persona_id: number | null
          prompt_template_ids: number[]
          system_prompt: string
          user_prompt: string
        }
        Insert: {
          company_id?: number | null
          context_data?: Json | null
          created_at?: string | null
          id?: number
          persona_id?: number | null
          prompt_template_ids: number[]
          system_prompt: string
          user_prompt: string
        }
        Update: {
          company_id?: number | null
          context_data?: Json | null
          created_at?: string | null
          id?: number
          persona_id?: number | null
          prompt_template_ids?: number[]
          system_prompt?: string
          user_prompt?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_persona"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_response_stats"
            referencedColumns: ["persona_id"]
          },
          {
            foreignKeyName: "fk_persona"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_logs_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_response_stats"
            referencedColumns: ["persona_id"]
          },
          {
            foreignKeyName: "prompt_logs_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
      prompts: {
        Row: {
          created_at: string | null
          id: number
          is_active: boolean | null
          name: string
          prompt_text: string
          prompt_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          is_active?: boolean | null
          name: string
          prompt_text: string
          prompt_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: never
          is_active?: boolean | null
          name?: string
          prompt_text?: string
          prompt_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      queries: {
        Row: {
          account_id: string | null
          buyer_journey_phase: string[] | null
          company_id: number | null
          created_at: string | null
          created_by_batch: boolean | null
          id: number
          persona_id: number | null
          prompt_id: number | null
          query_batch_id: string | null
          query_text: string
          user_id: string | null
        }
        Insert: {
          account_id?: string | null
          buyer_journey_phase?: string[] | null
          company_id?: number | null
          created_at?: string | null
          created_by_batch?: boolean | null
          id?: never
          persona_id?: number | null
          prompt_id?: number | null
          query_batch_id?: string | null
          query_text: string
          user_id?: string | null
        }
        Update: {
          account_id?: string | null
          buyer_journey_phase?: string[] | null
          company_id?: number | null
          created_at?: string | null
          created_by_batch?: boolean | null
          id?: never
          persona_id?: number | null
          prompt_id?: number | null
          query_batch_id?: string | null
          query_text?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "queries_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queries_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_response_stats"
            referencedColumns: ["persona_id"]
          },
          {
            foreignKeyName: "queries_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queries_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      response_analysis: {
        Row: {
          account_id: string | null
          analysis_batch_id: string | null
          answer_engine: string
          buyer_persona: string | null
          buying_journey_stage: string | null
          citations_parsed: Json | null
          cited: boolean | null
          company_id: number
          company_mentioned: boolean | null
          company_name: string
          competitors_list: string[] | null
          created_at: string | null
          created_by_batch: boolean | null
          geographic_region: string | null
          icp_vertical: string | null
          id: number
          industry_vertical: string | null
          mentioned_companies: string[] | null
          prompt_id: number | null
          prompt_name: string | null
          query_id: number | null
          query_text: string | null
          rank_list: string | null
          ranking_position: number | null
          recommended: boolean | null
          response_id: number | null
          response_text: string | null
          sentiment_score: number | null
          solution_analysis: Json | null
        }
        Insert: {
          account_id?: string | null
          analysis_batch_id?: string | null
          answer_engine: string
          buyer_persona?: string | null
          buying_journey_stage?: string | null
          citations_parsed?: Json | null
          cited?: boolean | null
          company_id: number
          company_mentioned?: boolean | null
          company_name: string
          competitors_list?: string[] | null
          created_at?: string | null
          created_by_batch?: boolean | null
          geographic_region?: string | null
          icp_vertical?: string | null
          id?: never
          industry_vertical?: string | null
          mentioned_companies?: string[] | null
          prompt_id?: number | null
          prompt_name?: string | null
          query_id?: number | null
          query_text?: string | null
          rank_list?: string | null
          ranking_position?: number | null
          recommended?: boolean | null
          response_id?: number | null
          response_text?: string | null
          sentiment_score?: number | null
          solution_analysis?: Json | null
        }
        Update: {
          account_id?: string | null
          analysis_batch_id?: string | null
          answer_engine?: string
          buyer_persona?: string | null
          buying_journey_stage?: string | null
          citations_parsed?: Json | null
          cited?: boolean | null
          company_id?: number
          company_mentioned?: boolean | null
          company_name?: string
          competitors_list?: string[] | null
          created_at?: string | null
          created_by_batch?: boolean | null
          geographic_region?: string | null
          icp_vertical?: string | null
          id?: never
          industry_vertical?: string | null
          mentioned_companies?: string[] | null
          prompt_id?: number | null
          prompt_name?: string | null
          query_id?: number | null
          query_text?: string | null
          rank_list?: string | null
          ranking_position?: number | null
          recommended?: boolean | null
          response_id?: number | null
          response_text?: string | null
          sentiment_score?: number | null
          solution_analysis?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_analysis_batch"
            columns: ["analysis_batch_id"]
            isOneToOne: false
            referencedRelation: "batch_metadata"
            referencedColumns: ["batch_id"]
          },
          {
            foreignKeyName: "response_analysis_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "response_analysis_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "response_analysis_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "response_analysis_query_id_fkey"
            columns: ["query_id"]
            isOneToOne: false
            referencedRelation: "queries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "response_analysis_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "responses"
            referencedColumns: ["id"]
          },
        ]
      }
      responses: {
        Row: {
          account_id: string | null
          answer_engine: string | null
          citations: string[] | null
          created_at: string | null
          created_by_batch: boolean | null
          id: number
          query_id: number | null
          response_batch_id: string | null
          response_text: string
          url: string | null
          websearchqueries: string[] | null
        }
        Insert: {
          account_id?: string | null
          answer_engine?: string | null
          citations?: string[] | null
          created_at?: string | null
          created_by_batch?: boolean | null
          id?: never
          query_id?: number | null
          response_batch_id?: string | null
          response_text: string
          url?: string | null
          websearchqueries?: string[] | null
        }
        Update: {
          account_id?: string | null
          answer_engine?: string | null
          citations?: string[] | null
          created_at?: string | null
          created_by_batch?: boolean | null
          id?: never
          query_id?: number | null
          response_batch_id?: string | null
          response_text?: string
          url?: string | null
          websearchqueries?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "responses_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responses_query_id_fkey"
            columns: ["query_id"]
            isOneToOne: false
            referencedRelation: "queries"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_overview_terms_test: {
        Row: {
          id: number
          company_id: number
          account_id: string
          term: string
          source: 'MOZ' | 'AI' | 'USER'
          status: 'ACTIVE' | 'ARCHIVED'
          created_at: string | null
        }
        Insert: {
          id?: number
          company_id: number
          account_id: string
          term: string
          source: 'MOZ' | 'AI' | 'USER'
          status: 'ACTIVE' | 'ARCHIVED'
          created_at?: string | null
        }
        Update: {
          id?: number
          company_id?: number
          account_id?: string
          term?: string
          source?: 'MOZ' | 'AI' | 'USER'
          status?: 'ACTIVE' | 'ARCHIVED'
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_overview_terms_test_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_overview_terms_test_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          }
        ]
      }
      ai_overview_tracking_test: {
        Row: {
          id: number
          term_id: number
          company_id: number
          account_id: string
          has_ai_overview: boolean
          company_mentioned: boolean
          competitor_mentions: string[]
          url: string | null
          checked_at: string | null
          content_snapshot: string | null
        }
        Insert: {
          id?: number
          term_id: number
          company_id: number
          account_id: string
          has_ai_overview: boolean
          company_mentioned: boolean
          competitor_mentions?: string[]
          url?: string | null
          checked_at?: string | null
          content_snapshot?: string | null
        }
        Update: {
          id?: number
          term_id?: number
          company_id?: number
          account_id?: string
          has_ai_overview?: boolean
          company_mentioned?: boolean
          competitor_mentions?: string[]
          url?: string | null
          checked_at?: string | null
          content_snapshot?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_overview_tracking_test_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "ai_overview_terms_test"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_overview_tracking_test_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_overview_tracking_test_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          id: number
          name: string
          company_id: number
          account_id: string
          created_at: string | null
        }
        Insert: {
          id?: never
          name: string
          company_id: number
          account_id: string
          created_at?: string | null
        }
        Update: {
          id?: never
          name?: string
          company_id?: number
          account_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      persona_response_stats: {
        Row: {
          latest_response_date: string | null
          persona_id: number | null
          persona_title: string | null
          questions_with_responses: number | null
          total_batches: number | null
          total_questions: number | null
        }
        Relationships: []
      }
      response_analysis_view: {
        Row: {
          buyer_persona: string | null
          buying_journey_stage: string | null
          citations_parsed: Json | null
          company_mentioned: boolean | null
          created_at: string | null
          geographic_region: string | null
          id: number | null
          industry_vertical: string | null
          ranking_position: number | null
          recommended: boolean | null
          response_id: number | null
          sentiment_score: number | null
        }
        Relationships: [
          {
            foreignKeyName: "response_analysis_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "responses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      citation_source_type: "OWNED" | "COMPETITOR" | "UGC" | "EARNED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export type CitationSourceType = "OWNED" | "COMPETITOR" | "UGC" | "EARNED";

export type ExistingCitationData = Database['public']['Tables']['citations']['Row'] & {
  // ... rest of the type
  source_type: CitationSourceType | null;
  // ... rest of the type
};
