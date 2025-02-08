import { mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
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
  private outputDir: string;

  constructor(
    templatesDir: string,
    outputDir: string,
    aiApiKey: string,
    aiApiUrl?: string
  ) {
    this.templateLoader = new TemplateLoader(templatesDir);
    this.aiService = new AIService(aiApiKey, aiApiUrl);
    this.outputDir = outputDir;
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

  /**
   * Generate project files from blueprint
   */
  async generateProject(blueprint: Blueprint): Promise<string> {
    // Create project directory
    const projectDir = join(this.outputDir, blueprint.configuration.name);
    await mkdir(projectDir, { recursive: true });

    // Generate component files
    for (const [path, content] of Object.entries(blueprint.components)) {
      const filePath = join(projectDir, path);
      const fileDir = dirname(filePath);
      
      // Create directory if it doesn't exist
      await mkdir(fileDir, { recursive: true });
      
      // Write file content
      await writeFile(filePath, content);
    }

    // Generate configuration files
    await this.generateConfigFiles(projectDir, blueprint);

    // Generate documentation
    await this.generateDocumentation(projectDir, blueprint);

    return projectDir;
  }

  /**
   * Generate project configuration files
   */
  private async generateConfigFiles(projectDir: string, blueprint: Blueprint): Promise<void> {
    const configFiles = {
      'package.json': this.generatePackageJson(blueprint),
      'tsconfig.json': this.generateTsConfig(),
      '.eslintrc.json': this.generateEslintConfig(),
      '.prettierrc': this.generatePrettierConfig(),
      'jest.config.js': this.generateJestConfig(blueprint.configuration.name),
      'next.config.js': blueprint.configuration.type === 'frontend' ? this.generateNextConfig() : undefined,
    };

    for (const [filename, content] of Object.entries(configFiles)) {
      if (content) {
        await writeFile(join(projectDir, filename), content);
      }
    }
  }

  /**
   * Generate project documentation
   */
  private async generateDocumentation(projectDir: string, blueprint: Blueprint): Promise<void> {
    const docsDir = join(projectDir, 'docs');
    await mkdir(docsDir, { recursive: true });

    const docs = {
      'README.md': this.generateReadme(blueprint),
      'ARCHITECTURE.md': this.generateArchitectureDoc(blueprint),
      'API.md': blueprint.configuration.type !== 'frontend' ? this.generateApiDoc(blueprint) : undefined,
    };

    for (const [filename, content] of Object.entries(docs)) {
      if (content) {
        await writeFile(join(docsDir, filename), content);
      }
    }
  }

  /**
   * Generate package.json content
   */
  private generatePackageJson(blueprint: Blueprint): string {
    const dependencies = this.getDependencies(blueprint);
    const devDependencies = this.getDevDependencies(blueprint);

    const packageJson = {
      name: blueprint.configuration.name,
      version: blueprint.configuration.version,
      description: blueprint.configuration.description,
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'eslint .',
        test: 'jest',
      },
      dependencies,
      devDependencies,
    };

    return JSON.stringify(packageJson, null, 2);
  }

  /**
   * Get project dependencies
   */
  private getDependencies(blueprint: Blueprint): Record<string, string> {
    const deps: Record<string, string> = {
      // Common dependencies
      typescript: '^5.0.0',
    };

    // Frontend dependencies
    if (['frontend', 'full-stack'].includes(blueprint.configuration.type)) {
      Object.assign(deps, {
        next: '^14.0.0',
        react: '^18.2.0',
        'react-dom': '^18.2.0',
      });

      // Add styling dependencies
      if (blueprint.configuration.techStack.frontend.styling === 'tailwind') {
        deps.tailwindcss = '^3.3.0';
        deps.autoprefixer = '^10.4.0';
        deps.postcss = '^8.4.0';
      }

      // Add state management
      if (blueprint.configuration.techStack.frontend.stateManagement === 'redux') {
        deps['@reduxjs/toolkit'] = '^1.9.0';
        deps['react-redux'] = '^8.1.0';
      }
    }

    // Backend dependencies
    if (['backend', 'full-stack'].includes(blueprint.configuration.type)) {
      Object.assign(deps, {
        express: '^4.18.0',
        cors: '^2.8.5',
        helmet: '^7.0.0',
      });

      // Add database dependencies
      if (blueprint.configuration.techStack.backend.database) {
        deps['@prisma/client'] = '^5.0.0';
      }

      // Add caching dependencies
      if (blueprint.configuration.techStack.backend.caching === 'redis') {
        deps.redis = '^4.6.0';
      }

      // Add authentication dependencies
      if (blueprint.configuration.techStack.backend.authentication === 'jwt') {
        deps['jsonwebtoken'] = '^9.0.0';
      }
    }

    return deps;
  }

  /**
   * Get project dev dependencies
   */
  private getDevDependencies(blueprint: Blueprint): Record<string, string> {
    return {
      '@types/node': '^20.0.0',
      '@types/react': '^18.2.0',
      '@types/react-dom': '^18.2.0',
      '@typescript-eslint/eslint-plugin': '^6.0.0',
      '@typescript-eslint/parser': '^6.0.0',
      'eslint': '^8.0.0',
      'eslint-config-prettier': '^9.0.0',
      'eslint-plugin-react': '^7.33.0',
      'eslint-plugin-react-hooks': '^4.6.0',
      'jest': '^29.0.0',
      'prettier': '^3.0.0',
      'ts-jest': '^29.0.0',
      'typescript': '^5.0.0',
    };
  }

  /**
   * Generate tsconfig.json content
   */
  private generateTsConfig(): string {
    const tsConfig = {
      compilerOptions: {
        target: 'ES2022',
        module: 'NodeNext',
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        noEmit: true,
        esModuleInterop: true,
        moduleResolution: 'NodeNext',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        incremental: true,
        baseUrl: '.',
        paths: {
          '@/*': ['./src/*'],
        },
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx'],
      exclude: ['node_modules'],
    };

    return JSON.stringify(tsConfig, null, 2);
  }

  /**
   * Generate .eslintrc.json content
   */
  private generateEslintConfig(): string {
    const eslintConfig = {
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'prettier',
      ],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint', 'react', 'react-hooks'],
      rules: {
        'react/react-in-jsx-scope': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
    };

    return JSON.stringify(eslintConfig, null, 2);
  }

  /**
   * Generate .prettierrc content
   */
  private generatePrettierConfig(): string {
    const prettierConfig = {
      semi: true,
      trailingComma: 'es5',
      singleQuote: true,
      printWidth: 100,
      tabWidth: 2,
      useTabs: false,
    };

    return JSON.stringify(prettierConfig, null, 2);
  }

  /**
   * Generate jest.config.js content
   */
  private generateJestConfig(projectName: string): string {
    return `module.exports = {
      preset: 'ts-jest',
      testEnvironment: 'node',
      roots: ['<rootDir>/src'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!**/*.d.ts',
      ],
      coverageThreshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    };`;
  }

  /**
   * Generate next.config.js content
   */
  private generateNextConfig(): string {
    return `/** @type {import('next').NextConfig} */
    module.exports = {
      reactStrictMode: true,
    };`;
  }

  /**
   * Generate README.md content
   */
  private generateReadme(blueprint: Blueprint): string {
    return `# ${blueprint.configuration.name}

${blueprint.configuration.description}

## Tech Stack

### Frontend
${this.generateTechStackSection(blueprint.configuration.techStack.frontend)}

### Backend
${this.generateTechStackSection(blueprint.configuration.techStack.backend)}

### Deployment
${this.generateTechStackSection(blueprint.configuration.techStack.deployment)}

## Features

${blueprint.configuration.features.map(feature => `- ${feature}`).join('\n')}

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Documentation

- [Architecture](./docs/ARCHITECTURE.md)
${blueprint.configuration.type !== 'frontend' ? '- [API Documentation](./docs/API.md)' : ''}

## Scripts

- \`npm run dev\`: Start development server
- \`npm run build\`: Build production bundle
- \`npm run start\`: Start production server
- \`npm run test\`: Run tests
- \`npm run lint\`: Run linter

## License

This project is private and confidential.
`;
  }

  /**
   * Generate tech stack section for README
   */
  private generateTechStackSection(stack: any): string {
    return Object.entries(stack)
      .filter(([_, value]) => value)
      .map(([key, value]) => `- ${key}: ${value}`)
      .join('\n');
  }

  /**
   * Generate ARCHITECTURE.md content
   */
  private generateArchitectureDoc(blueprint: Blueprint): string {
    return `# ${blueprint.configuration.name} - Architecture

## Overview

${blueprint.configuration.description}

## System Architecture

This application follows a ${blueprint.configuration.type} architecture using the following technologies:

${this.generateTechStackSection(blueprint.configuration.techStack)}

## Directory Structure

\`\`\`
src/
├── components/     # React components
├── pages/         # Next.js pages
├── styles/        # CSS styles
├── lib/          # Utility functions
├── api/          # API routes
└── types/        # TypeScript types
\`\`\`

## Key Components

${blueprint.aiAnalysis.content}

## Data Flow

1. User interaction triggers component state changes
2. Components dispatch actions/mutations
3. State management handles data updates
4. UI updates reflect new state

## Security

- Authentication: ${blueprint.configuration.techStack.backend.authentication || 'None'}
- Authorization: Role-based access control
- Data encryption in transit and at rest
- Regular security audits

## Performance

- Server-side rendering for initial page load
- Static generation for static content
- API route optimization
- Caching strategy: ${blueprint.configuration.techStack.backend.caching || 'None'}

## Monitoring

- Error tracking
- Performance monitoring
- Usage analytics
- Health checks

## Deployment

Platform: ${blueprint.configuration.techStack.deployment.platform}
${blueprint.configuration.techStack.deployment.containerization ? `Containerization: ${blueprint.configuration.techStack.deployment.containerization}` : ''}
${blueprint.configuration.techStack.deployment.orchestration ? `Orchestration: ${blueprint.configuration.techStack.deployment.orchestration}` : ''}

## Development Workflow

1. Local development using \`npm run dev\`
2. Code review process
3. Automated testing
4. CI/CD pipeline
5. Deployment to staging/production
`;
  }

  /**
   * Generate API.md content
   */
  private generateApiDoc(blueprint: Blueprint): string {
    return `# ${blueprint.configuration.name} - API Documentation

## Overview

This document describes the API endpoints available in the application.

## Base URL

\`\`\`
${blueprint.configuration.configuration?.backend?.baseUrl || 'http://localhost:4000'}
\`\`\`

## Authentication

${blueprint.configuration.techStack.backend.authentication
  ? `Authentication is handled using ${blueprint.configuration.techStack.backend.authentication}`
  : 'No authentication required'}

## Rate Limiting

${blueprint.configuration.configuration?.backend?.rateLimit
  ? `Requests are limited to ${blueprint.configuration.configuration.backend.rateLimit} per minute`
  : 'No rate limiting applied'}

## Endpoints

[API endpoints will be documented here based on the generated routes]

## Error Handling

All errors follow this format:

\`\`\`json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
\`\`\`

## Common Status Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

## Data Models

[Data models will be documented here based on the generated schemas]
`;
  }
} 