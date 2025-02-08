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

  constructor(apiKey: string, baseUrl: string = 'https://api.anthropic.com/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Generate project configuration from text description
   */
  async generateProjectConfig(description: string): Promise<ProjectConfig> {
    const prompt = `
      Generate a web application project configuration based on the following description:
      ${description}

      The configuration should include:
      1. Project type and category
      2. Required features
      3. Project name and description
      4. Tech stack (using our standardized stack):
         - Frontend: Next.js, React, TypeScript, Tailwind CSS, Redux
         - Backend: Node.js, Express, PostgreSQL, Redis
         - Deployment: AWS, Docker, GitHub Actions

      The response should be a valid JSON object matching this TypeScript interface:

      interface ProjectConfig {
        type: 'web-app' | 'api' | 'landing-page' | 'dashboard' | 'e-commerce';
        category: 'web' | 'backend';
        name: string;
        description: string;
        features: Array<
          | 'authentication'
          | 'authorization'
          | 'database'
          | 'api'
          | 'file-upload'
          | 'notifications'
          | 'search'
          | 'analytics'
          | 'localization'
          | 'payment'
          | 'email'
          | 'seo'
          | 'testing'
          | 'documentation'
        >;
        techStack: {
          frontend: {
            framework: 'react';
            styling: 'tailwind';
            stateManagement: 'redux';
          };
          backend: {
            framework: 'express';
            database: 'postgresql';
            caching: 'redis';
            auth: 'jwt';
          };
          deployment: {
            platform: 'aws';
            containerization: 'docker';
            ci: 'github-actions';
          };
        };
      }

      Please ensure the response is a valid JSON object that exactly matches this interface.
    `;

    const response = await this.makeAIRequest(prompt);
    try {
      const config = JSON.parse(response.content);
      return ProjectConfigSchema.parse(config);
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      throw new Error('Failed to generate valid project configuration');
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

    return this.makeAIRequest(prompt);
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

    return this.makeAIRequest(prompt);
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

    return this.makeAIRequest(prompt);
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

    return this.makeAIRequest(prompt);
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

    return this.makeAIRequest(prompt);
  }

  /**
   * Make a request to the AI API
   */
  private async makeAIRequest(prompt: string): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 4096,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return AIResponseSchema.parse({
        content: data.content[0].text,
        suggestions: data.content[0].suggestions,
        metadata: data.content[0].metadata,
      });
    } catch (error) {
      console.error('AI request failed:', error);
      throw new Error('Failed to process AI request');
    }
  }
} 