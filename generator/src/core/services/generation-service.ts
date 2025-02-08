import { z } from 'zod';
import { ProjectConfigSchema, ProjectSchema, type Project } from '../models/project';
import { Template } from '../models/template';
import { Blueprint } from '../models/blueprint';
import { TemplateLoader } from './template-loader';
import { AIService } from './ai-service';

export class GenerationService {
  private templates: Map<string, Template> = new Map();
  private templateLoader: TemplateLoader;
  private aiService: AIService;

  constructor(
    templatesDir: string,
    aiApiKey: string,
    aiApiUrl?: string
  ) {
    this.templateLoader = new TemplateLoader(templatesDir);
    this.aiService = new AIService(aiApiKey, aiApiUrl);
  }

  /**
   * Initialize the service by loading all templates
   */
  async initialize(): Promise<void> {
    const templates = await this.templateLoader.loadAllTemplates();
    for (const template of templates) {
      this.registerTemplate(template);
    }
  }

  /**
   * Register a template for use in generation
   */
  registerTemplate(template: Template): void {
    this.templates.set(template.name, template);
  }

  /**
   * Get a template by name
   */
  async getTemplate(name: string): Promise<Template> {
    let template = this.templates.get(name);
    if (!template) {
      template = await this.templateLoader.loadTemplate(name);
      this.registerTemplate(template);
    }
    return template;
  }

  /**
   * Generate a blueprint for a project
   */
  async generateBlueprint(project: Project): Promise<Blueprint> {
    // Validate project configuration
    const validatedProject = ProjectSchema.parse(project);

    // Analyze requirements using AI
    const analysis = await this.aiService.analyzeRequirements(validatedProject.config);

    // Select appropriate template
    const template = await this.selectTemplate(validatedProject.config);
    if (!template) {
      throw new Error('No compatible template found for project requirements');
    }

    // Generate optimized component code
    const components = await this.generateComponents(template, validatedProject);

    // Create and return blueprint
    return {
      metadata: {
        projectId: validatedProject.metadata.id,
        generatedAt: new Date().toISOString(),
        aiAnalysis: analysis,
      },
      template: template.name,
      components,
      configuration: validatedProject.config,
    };
  }

  /**
   * Select the most appropriate template for the project
   */
  private async selectTemplate(
    config: z.infer<typeof ProjectConfigSchema>
  ): Promise<Template | null> {
    for (const template of this.templates.values()) {
      if (this.isTemplateCompatible(template, config)) {
        return template;
      }
    }
    return null;
  }

  /**
   * Check if a template is compatible with project requirements
   */
  private isTemplateCompatible(
    template: Template,
    config: z.infer<typeof ProjectConfigSchema>
  ): boolean {
    // Check framework compatibility
    const frontendMatch = template.compatibility.frontend.framework === config.techStack.frontend.framework;
    const backendMatch = template.compatibility.backend.framework === config.techStack.backend.framework;

    // Check feature support
    const requiredFeatures = new Set(config.features);
    const supportedFeatures = new Set(template.compatibility.features);
    const hasAllFeatures = Array.from(requiredFeatures).every(feature =>
      supportedFeatures.has(feature)
    );

    return frontendMatch && backendMatch && hasAllFeatures;
  }

  /**
   * Generate components using template and AI assistance
   */
  private async generateComponents(
    template: Template,
    project: Project
  ): Promise<Record<string, string>> {
    const components: Record<string, string> = {};

    for (const [path, templateContent] of Object.entries(template.files)) {
      // Generate initial component
      const variables = {
        project: project.config,
        metadata: project.metadata,
      };

      const generated = await this.aiService.generateComponent(
        templateContent,
        variables,
        this.getComponentType(path)
      );

      // Optimize the generated code
      const optimized = await this.aiService.optimizeCode(
        generated.content,
        `Component for ${path} in ${project.config.name}`
      );

      // Generate documentation
      const documented = await this.aiService.generateDocumentation(
        optimized.content,
        this.getComponentType(path)
      );

      components[path] = documented.content;
    }

    return components;
  }

  /**
   * Determine component type from file path
   */
  private getComponentType(path: string): 'component' | 'api' | 'service' {
    if (path.includes('/components/')) return 'component';
    if (path.includes('/api/')) return 'api';
    return 'service';
  }
} 