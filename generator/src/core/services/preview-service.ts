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
      await this.validateTechStackCompatibility(config, result);
      await this.validateFeatureCompatibility(config, result);
      await this.validateDeploymentConfiguration(config, result);

    } catch (error) {
      if (error instanceof z.ZodError) {
        result.isValid = false;
        result.errors = this.formatZodErrors(error);
      }
    }

    return result;
  }

  /**
   * Validate tech stack compatibility
   */
  private async validateTechStackCompatibility(
    config: Partial<ProjectConfig>,
    result: ValidationResult
  ): Promise<void> {
    const { techStack } = config;
    if (!techStack) return;

    // Frontend framework compatibility
    if (techStack.frontend?.framework === 'next' && techStack.backend?.framework !== 'express') {
      result.warnings['techStack.backend.framework'] = [
        'Next.js works best with Express.js for API routes',
      ];
    }

    // State management compatibility
    if (
      techStack.frontend?.stateManagement === 'redux' &&
      !config.features?.includes('state-management')
    ) {
      result.warnings['features'] = [
        'Redux is included but state-management feature is not enabled',
      ];
    }

    // Database compatibility
    if (techStack.backend?.database === 'postgresql' && !config.features?.includes('database')) {
      result.warnings['features'] = [
        ...(result.warnings['features'] || []),
        'PostgreSQL is selected but database feature is not enabled',
      ];
    }
  }

  /**
   * Validate feature compatibility
   */
  private async validateFeatureCompatibility(
    config: Partial<ProjectConfig>,
    result: ValidationResult
  ): Promise<void> {
    const { features } = config;
    if (!features) return;

    // Authentication dependencies
    if (features.includes('authentication') && !config.techStack?.backend?.authentication) {
      result.errors['techStack.backend.authentication'] = [
        'Authentication feature requires an authentication method',
      ];
    }

    // API dependencies
    if (features.includes('api') && !config.techStack?.backend?.framework) {
      result.errors['techStack.backend.framework'] = [
        'API feature requires a backend framework',
      ];
    }

    // Database dependencies
    if (features.includes('database') && !config.techStack?.backend?.database) {
      result.errors['techStack.backend.database'] = [
        'Database feature requires a database selection',
      ];
    }
  }

  /**
   * Validate deployment configuration
   */
  private async validateDeploymentConfiguration(
    config: Partial<ProjectConfig>,
    result: ValidationResult
  ): Promise<void> {
    const { deployment } = config.techStack || {};
    if (!deployment) return;

    // Kubernetes requirements
    if (deployment.orchestration === 'kubernetes' && deployment.containerization !== 'docker') {
      result.errors['techStack.deployment.containerization'] = [
        'Kubernetes requires Docker containerization',
      ];
    }

    // Cloud platform compatibility
    if (deployment.platform === 'vercel' && config.type === 'full-stack') {
      result.warnings['techStack.deployment.platform'] = [
        'Vercel deployment works best with frontend-only applications',
      ];
    }
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
    const deps: Record<string, string> = {
      [config.techStack.frontend.framework]: '^14.0.0',
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
    };

    if (config.techStack.frontend.styling === 'tailwind') {
      deps['tailwindcss'] = '^3.3.0';
    }

    if (config.techStack.frontend.stateManagement === 'redux') {
      deps['@reduxjs/toolkit'] = '^2.0.0';
    }

    return deps;
  }

  /**
   * Get configuration preview
   */
  private getConfiguration(config: ProjectConfig): Record<string, any> {
    return {
      name: config.name,
      version: config.version,
      type: config.type,
      features: config.features,
      techStack: config.techStack,
    };
  }
} 