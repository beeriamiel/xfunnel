export type AIModelType = "claude-3.5-sonnet" | "gpt-4-turbo-preview";

export interface ICPGenerationResponse {
  company_information: {
    name: string;
    industry: string;
    main_products: string[];
    product_category: string;
    number_of_employees: number;
    annual_revenue: string;
    markets_operating_in: string[];
  };
  main_competitors: string[];
  ideal_customer_profiles: Array<{
    vertical: string;
    company_size: string;
    region: string;
    personas: Array<{
      title: string;
      seniority_level: string;
      department: string;
    }>;
  }>;
}

export interface QuestionGenerationResponse {
  questions: Array<{
    query_text: string;
    buyer_journey_phase: string[];
  }>;
}

export interface AIService {
  generateICPs(
    systemPrompt: string,
    userPrompt: string,
    context: Record<string, any>
  ): Promise<ICPGenerationResponse>;

  generateQuestions(
    systemPrompt: string,
    userPrompt: string,
    context: Record<string, any>
  ): Promise<QuestionGenerationResponse>;
} 