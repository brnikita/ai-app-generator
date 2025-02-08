import { z } from 'zod';
import { ProjectConfig, ProjectConfigSchema } from '../models/project';
import { Template } from '../models/template';

// AI response schema
const AIResponseSchema = z.object({
  content: z.string(),
  suggestions: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

type AIResponse = z.infer<typeof AIResponseSchema>;

export class AIService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = '/api') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Generate project configuration from text description
   */
  async generateProjectConfig(description: string): Promise<ProjectConfig> {
    try {
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate project configuration');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('AI Service error:', error);
      throw error;
    }
  }

  /**
   * Analyze project requirements and suggest improvements
   */
  async analyzeRequirements(config: ProjectConfig): Promise<AIResponse> {
    const prompt = `
      Analyze the following web application requirements and suggest improvements:
      Project Name: ${config.name}
      Description: ${config.description}
      Type: ${config.type}
      Features: ${config.features.join(', ')}
      Tech Stack:
      - Frontend: ${JSON.stringify(config.techStack.frontend, null, 2)}
      - Backend: ${JSON.stringify(config.techStack.backend, null, 2)}
      - Deployment: ${JSON.stringify(config.techStack.deployment, null, 2)}

      Please provide:
      1. Architecture recommendations
      2. Additional features to consider
      3. Potential scalability concerns
      4. Security considerations
    `;

    return this.makeAIRequest('/api/messages', { prompt });
  }

  /**
   * Generate component code based on template and requirements
   */
  async generateComponent(
    template: string,
    variables: Record<string, any>,
    type: string
  ): Promise<AIResponse> {
    const prompt = `
      Generate a ${type} component using the following template and variables:
      Template:
      ${template}

      Variables:
      ${JSON.stringify(variables, null, 2)}

      Requirements:
      1. Follow TypeScript best practices
      2. Include proper error handling
      3. Add comprehensive comments
      4. Consider accessibility
      5. Optimize performance
    `;

    return this.makeAIRequest('/api/messages', { prompt });
  }

  /**
   * Optimize generated code for best practices
   */
  async optimizeCode(code: string, context: string): Promise<AIResponse> {
    const prompt = `
      Optimize the following code while maintaining functionality:
      Context: ${context}

      Code:
      ${code}

      Please:
      1. Improve performance
      2. Enhance readability
      3. Add error handling
      4. Fix potential issues
      5. Follow best practices
    `;

    return this.makeAIRequest('/api/messages', { prompt });
  }

  /**
   * Generate documentation for components or APIs
   */
  async generateDocumentation(
    code: string,
    type: 'component' | 'api' | 'service'
  ): Promise<AIResponse> {
    const prompt = `
      Generate comprehensive documentation for the following ${type}:
      ${code}

      Include:
      1. Overview and purpose
      2. Usage examples
      3. API reference
      4. Parameters/props
      5. Return values
      6. Error handling
    `;

    return this.makeAIRequest('/api/messages', { prompt });
  }

  /**
   * Suggest test cases for components or functions
   */
  async suggestTests(code: string, context: string): Promise<AIResponse> {
    const prompt = `
      Suggest test cases for the following code:
      Context: ${context}

      Code:
      ${code}

      Include tests for:
      1. Happy path scenarios
      2. Edge cases
      3. Error conditions
      4. Performance considerations
      5. Integration points
    `;

    return this.makeAIRequest('/api/messages', { prompt });
  }

  /**
   * Make a request to the AI API
   */
  async makeAIRequest(endpoint: string, body: any): Promise<any> {
    // If the endpoint is not an absolute URL, prepend the base URL
    const baseUrl = process.env.AI_API_BASE_URL || 'http://localhost:3000';
    const fullUrl = endpoint.startsWith('http') ? endpoint : new URL(endpoint, baseUrl).toString();

    console.log(`[AIService] Making AI request to: ${fullUrl}`);

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[AIService] AI request failed:', errorData);
      throw new Error('Failed to process AI request');
    }

    return response.json();
  }
}
