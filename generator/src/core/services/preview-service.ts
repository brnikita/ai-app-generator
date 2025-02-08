import { z } from 'zod';
import { ProjectConfig, ProjectConfigSchema } from '../models/project';
import { Template } from '../models/template';
import { AIService } from './ai-service';

export interface PreviewState {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
  suggestions: string[];
  preview: {
    components: Record<string, string>;
    dependencies: Record<string, string>;
    configuration: Record<string, any>;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
}

export class PreviewService {
  private aiService: AIService;
  private currentState: PreviewState;

  constructor(aiApiKey: string, aiApiUrl?: string) {
    this.aiService = new AIService(aiApiKey, aiApiUrl);
    this.currentState = this.getInitialState();
  }

  /**
   * Generate project configuration from text description
   */
  async generateFromDescription(description: string): Promise<ProjectConfig> {
    try {
      const config = await this.aiService.generateProjectConfig(description);
      
      // Validate the generated config
      const validation = await this.validateConfiguration(config);
      if (!validation.isValid) {
        throw new Error('Generated configuration is invalid: ' + JSON.stringify(validation.errors));
      }

      return config;
    } catch (error) {
      console.error('Failed to generate configuration:', error);
      throw new Error('Failed to generate project configuration from description');
    }
  }

  /**
   * Get initial preview state
   */
  private getInitialState(): PreviewState {
    return {
      isValid: false,
      errors: {},
      warnings: {},
      suggestions: [],
      preview: {
        components: {},
        dependencies: {},
        configuration: {},
      },
    };
  }

  /**
   * Update preview with new configuration
   */
  async updatePreview(config: Partial<ProjectConfig>, template?: Template): Promise<PreviewState> {
    // Validate configuration
    const validation = await this.validateConfiguration(config);
    
    // Update state with validation results
    this.currentState.isValid = validation.isValid;
    this.currentState.errors = validation.errors;
    this.currentState.warnings = validation.warnings;

    if (validation.isValid) {
      // Generate component previews
      if (template) {
        await this.generateComponentPreviews(config as ProjectConfig, template);
      }

      // Get AI suggestions
      const analysis = await this.aiService.analyzeRequirements(config as ProjectConfig);
      this.currentState.suggestions = analysis.suggestions || [];
    }

    return this.currentState;
  }

  /**
   * Validate project configuration
   */
  private async validateConfiguration(config: Partial<ProjectConfig>): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: {},
      warnings: {},
    };

    try {
      // Validate against schema
      ProjectConfigSchema.parse(config);

      // Additional validation rules
      if (config.features?.includes('database') && !config.techStack?.backend?.database) {
        result.errors['techStack.backend.database'] = [
          'Database feature requires PostgreSQL database',
        ];
      }

      if (config.features?.includes('authentication') && !config.techStack?.backend?.auth) {
        result.errors['techStack.backend.auth'] = [
          'Authentication feature requires JWT authentication',
        ];
      }

      if (config.features?.includes('api') && !config.techStack?.backend?.framework) {
        result.errors['techStack.backend.framework'] = [
          'API feature requires Express.js backend',
        ];
      }

    } catch (error) {
      if (error instanceof z.ZodError) {
        result.isValid = false;
        result.errors = this.formatZodErrors(error);
      }
    }

    return result;
  }

  /**
   * Format Zod validation errors
   */
  private formatZodErrors(error: z.ZodError): Record<string, string[]> {
    const errors: Record<string, string[]> = {};
    
    for (const issue of error.issues) {
      const path = issue.path.join('.');
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(issue.message);
    }

    return errors;
  }

  /**
   * Generate component previews
   */
  private async generateComponentPreviews(
    config: ProjectConfig,
    template: Template
  ): Promise<void> {
    const previewComponents: Record<string, string> = {};

    // Generate preview for each template component
    for (const [path, templateContent] of Object.entries(template.files)) {
      if (path.endsWith('.tsx') || path.endsWith('.jsx')) {
        const variables = {
          project: config,
          component: {
            name: path.split('/').pop()?.replace(/\.[^/.]+$/, ''),
            type: this.getComponentType(path),
          },
        };

        const generated = await this.aiService.generateComponent(
          templateContent,
          variables,
          this.getComponentType(path)
        );

        previewComponents[path] = generated.content;
      }
    }

    this.currentState.preview.components = previewComponents;
    this.currentState.preview.dependencies = this.getDependencies(config);
    this.currentState.preview.configuration = this.getConfiguration(config);
  }

  /**
   * Get component type from file path
   */
  private getComponentType(path: string): string {
    if (path.startsWith('pages/')) return 'page';
    if (path.startsWith('components/')) return 'component';
    if (path.startsWith('layouts/')) return 'layout';
    return 'component';
  }

  /**
   * Get dependencies based on configuration
   */
  private getDependencies(config: ProjectConfig): Record<string, string> {
    return {
      'next': '^14.0.0',
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
      'tailwindcss': '^3.3.0',
      '@reduxjs/toolkit': '^2.0.0',
      'express': '^4.18.2',
      'pg': '^8.11.0',
      'redis': '^4.6.0',
      'jsonwebtoken': '^9.0.0',
    };
  }

  /**
   * Get configuration preview
   */
  private getConfiguration(config: ProjectConfig): Record<string, any> {
    return {
      name: config.name,
      type: config.type,
      features: config.features,
      techStack: config.techStack,
    };
  }
} 