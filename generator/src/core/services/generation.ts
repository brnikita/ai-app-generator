import { ProjectConfig, ProjectSchema, type Project } from '../models/project';
import { Template, TemplateSchema } from '../models/template';
import { Blueprint, BlueprintSchema, createBlueprint } from '../models/blueprint';

export class GenerationService {
  private templates: Map<string, Template>;

  constructor() {
    this.templates = new Map();
  }

  // Register a template for use in generation
  async registerTemplate(template: Template): Promise<void> {
    // Validate template
    TemplateSchema.parse(template);
    this.templates.set(template.config.name, template);
  }

  // Get a registered template by name
  async getTemplate(name: string): Promise<Template | undefined> {
    return this.templates.get(name);
  }

  // Generate a blueprint from project configuration
  async generateBlueprint(project: Project): Promise<Blueprint> {
    // Validate project
    ProjectSchema.parse(project);

    // Select appropriate template based on project type
    const template = await this.selectTemplate(project.config);
    if (!template) {
      throw new Error(`No suitable template found for project type: ${project.config.type}`);
    }

    // Create initial blueprint
    const blueprint = createBlueprint(
      project.metadata.id,
      project.config,
      'generator'
    );

    // Validate blueprint
    BlueprintSchema.parse(blueprint);

    // Apply template to blueprint
    await this.applyTemplate(blueprint, template);

    return blueprint;
  }

  // Select the most appropriate template for the project
  private async selectTemplate(config: ProjectConfig): Promise<Template | undefined> {
    // Find template matching project type and tech stack
    for (const template of this.templates.values()) {
      if (
        template.config.category === config.type &&
        this.isTemplateCompatible(template, config)
      ) {
        return template;
      }
    }
    return undefined;
  }

  // Check if template is compatible with project configuration
  private isTemplateCompatible(template: Template, config: ProjectConfig): boolean {
    const { techStack } = template.config;

    // Check frontend compatibility
    if (techStack.frontend && config.techStack.frontend) {
      if (
        !techStack.frontend.framework.includes(config.techStack.frontend.framework) ||
        !techStack.frontend.styling.includes(config.techStack.frontend.styling) ||
        !techStack.frontend.stateManagement.includes(config.techStack.frontend.stateManagement)
      ) {
        return false;
      }
    }

    // Check backend compatibility
    if (techStack.backend && config.techStack.backend) {
      if (
        !techStack.backend.framework.includes(config.techStack.backend.framework) ||
        !techStack.backend.database.includes(config.techStack.backend.database) ||
        !techStack.backend.authentication.includes(config.techStack.backend.authentication)
      ) {
        return false;
      }
    }

    // Check deployment compatibility
    return techStack.deployment.platforms.includes(config.techStack.deployment.platform);
  }

  // Apply template to blueprint
  private async applyTemplate(blueprint: Blueprint, template: Template): Promise<void> {
    // Execute pre-generation hooks
    if (template.structure.hooks?.preGeneration) {
      for (const hook of template.structure.hooks.preGeneration) {
        await this.executeHook(hook, blueprint);
      }
    }

    // Process template files
    for (const file of template.structure.files) {
      if (file.type === 'directory') {
        // Create directory in blueprint
        blueprint.structure.components.push({
          name: file.path,
          type: 'layout',
          path: file.path,
          dependencies: [],
          template: '',
          variables: {},
        });
      } else {
        // Process file template
        if (file.template) {
          const variables = {
            ...file.variables,
            projectName: blueprint.projectConfig.name,
            projectType: blueprint.projectConfig.type,
          };

          blueprint.structure.components.push({
            name: file.path,
            type: this.determineComponentType(file.path),
            path: file.path,
            dependencies: [],
            template: file.template,
            variables,
          });
        }
      }
    }

    // Execute post-generation hooks
    if (template.structure.hooks?.postGeneration) {
      for (const hook of template.structure.hooks.postGeneration) {
        await this.executeHook(hook, blueprint);
      }
    }

    // Validate final blueprint
    BlueprintSchema.parse(blueprint);
  }

  // Execute a template hook
  private async executeHook(hook: string, blueprint: Blueprint): Promise<void> {
    // Hook implementation will be added later
    console.log(`Executing hook: ${hook}`);
  }

  // Determine component type based on file path
  private determineComponentType(path: string): 'page' | 'component' | 'layout' | 'api' | 'model' | 'service' {
    if (path.startsWith('pages/')) return 'page';
    if (path.startsWith('components/')) return 'component';
    if (path.startsWith('layouts/')) return 'layout';
    if (path.startsWith('api/')) return 'api';
    if (path.startsWith('models/')) return 'model';
    if (path.startsWith('services/')) return 'service';
    return 'component';
  }
} 