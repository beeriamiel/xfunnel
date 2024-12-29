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
      batch_metadata: {
        Row: {
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
          buyer_journey_phase: string | null
          buyer_persona: string | null
          citation_order: number
          citation_url: string
          company_id: number
          company_mentioned: boolean | null
          created_at: string | null
          icp_vertical: string | null
          id: number
          mentioned_companies: string[] | null
          rank_list: string | null
          ranking_position: number | null
          recommended: boolean | null
          region: string | null
          response_analysis_id: number
          response_text: string | null
          updated_at: string | null
          domain_authority: number | null
          source_type: string | null
          query_text: string | null
          content_analysis: string | null
          content_markdown: string | null
          content_scraped_at: string | null
          content_scraping_error: string | null
        }
        Insert: {
          buyer_journey_phase?: string | null
          buyer_persona?: string | null
          citation_order: number
          citation_url: string
          company_id: number
          company_mentioned?: boolean | null
          created_at?: string | null
          icp_vertical?: string | null
          id?: never
          mentioned_companies?: string[] | null
          rank_list?: string | null
          ranking_position?: number | null
          recommended?: boolean | null
          region?: string | null
          response_analysis_id: number
          response_text?: string | null
          updated_at?: string | null
          domain_authority?: number | null
          source_type?: string | null
          query_text?: string | null
          content_analysis?: string | null
          content_markdown?: string | null
          content_scraped_at?: string | null
          content_scraping_error?: string | null
        }
        Update: {
          buyer_journey_phase?: string | null
          buyer_persona?: string | null
          citation_order?: number
          citation_url?: string
          company_id?: number
          company_mentioned?: boolean | null
          created_at?: string | null
          icp_vertical?: string | null
          id?: never
          mentioned_companies?: string[] | null
          rank_list?: string | null
          ranking_position?: number | null
          recommended?: boolean | null
          region?: string | null
          response_analysis_id?: number
          response_text?: string | null
          updated_at?: string | null
          domain_authority?: number | null
          source_type?: string | null
          query_text?: string | null
          content_analysis?: string | null
          content_markdown?: string | null
          content_scraped_at?: string | null
          content_scraping_error?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
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
        Relationships: []
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
          company_id: number | null
          company_size: string
          created_at: string | null
          created_by_batch: boolean | null
          icp_batch_id: string | null
          id: number
          region: string
          vertical: string
        }
        Insert: {
          company_id?: number | null
          company_size: string
          created_at?: string | null
          created_by_batch?: boolean | null
          icp_batch_id?: string | null
          id?: number
          region: string
          vertical: string
        }
        Update: {
          company_id?: number | null
          company_size?: string
          created_at?: string | null
          created_by_batch?: boolean | null
          icp_batch_id?: string | null
          id?: number
          region?: string
          vertical?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_icp_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      personas: {
        Row: {
          created_at: string | null
          department: string
          icp_id: number | null
          id: number
          seniority_level: string
          title: string
        }
        Insert: {
          created_at?: string | null
          department: string
          icp_id?: number | null
          id?: number
          seniority_level: string
          title: string
        }
        Update: {
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
            foreignKeyName: "responses_query_id_fkey"
            columns: ["query_id"]
            isOneToOne: false
            referencedRelation: "queries"
            referencedColumns: ["id"]
          },
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
      [_ in never]: never
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
