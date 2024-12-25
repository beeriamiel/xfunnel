import { AIService, AIModelType } from './types';
import { OpenAIService } from './openai-service';
import { ClaudeService } from './claude-service';

export class AIServiceFactory {
  private static instance: AIServiceFactory;
  private services: Map<AIModelType, AIService>;

  private constructor() {
    this.services = new Map();
    this.services.set('gpt-4-turbo-preview', new OpenAIService());
    this.services.set('claude-3.5-sonnet', new ClaudeService());
  }

  public static getInstance(): AIServiceFactory {
    if (!AIServiceFactory.instance) {
      AIServiceFactory.instance = new AIServiceFactory();
    }
    return AIServiceFactory.instance;
  }

  public getService(model: AIModelType): AIService {
    const service = this.services.get(model);
    if (!service) {
      throw new Error(`No service found for model: ${model}`);
    }
    return service;
  }
} 