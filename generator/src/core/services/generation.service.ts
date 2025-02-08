import { mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { Blueprint } from '../models/blueprint';
import { Project, ProjectConfig } from '../models/project';
import { AIService } from './ai.service';
import { TemplateService } from './template.service';

export class GenerationService {
  constructor(
    private readonly outputDir: string,
    private readonly aiService: AIService,
    private readonly templateService: TemplateService
  ) {}

  async generateProject(blueprint: Blueprint): Promise<string> {
    const projectDir = join(this.outputDir, blueprint.metadata.projectId);
    
    // Create project directory
    await mkdir(projectDir, { recursive: true });

    // Generate component files
    for (const [path, content] of Object.entries(blueprint.components)) {
      const fullPath = join(projectDir, path);
      await mkdir(dirname(fullPath), { recursive: true });
      await writeFile(fullPath, content);
    }

    // Generate configuration files
    await this.generateConfigFiles(projectDir, blueprint);

    // Generate documentation
    await this.generateDocumentation(projectDir, blueprint);

    return projectDir;
  }

  private async generateConfigFiles(projectDir: string, blueprint: Blueprint): Promise<void> {
    const configFiles = {
      'package.json': this.generatePackageJson(blueprint),
      'tsconfig.json': this.generateTsConfig(blueprint),
      'README.md': this.generateReadme(blueprint),
    };

    for (const [filename, content] of Object.entries(configFiles)) {
      await writeFile(join(projectDir, filename), content);
    }
  }

  private generatePackageJson(blueprint: Blueprint): string {
    const { configuration } = blueprint;
    return JSON.stringify({
      name: configuration.name,
      version: '0.1.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint'
      },
      dependencies: configuration.dependencies || {},
      devDependencies: configuration.devDependencies || {}
    }, null, 2);
  }

  private generateTsConfig(blueprint: Blueprint): string {
    return JSON.stringify({
      compilerOptions: {
        target: 'es5',
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'node',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        incremental: true
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx'],
      exclude: ['node_modules']
    }, null, 2);
  }

  private generateReadme(blueprint: Blueprint): string {
    const { configuration, aiAnalysis } = blueprint;
    return `# ${configuration.name}

${aiAnalysis.content}

## Features

${configuration.features?.map(feature => `- ${feature}`).join('\n') || 'No features specified'}

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- Frontend: ${configuration.techStack?.frontend?.framework || 'Not specified'}
- Backend: ${configuration.techStack?.backend?.framework || 'Not specified'}
- Deployment: ${configuration.techStack?.deployment?.platform || 'Not specified'}

## Project Structure

${aiAnalysis.suggestions?.join('\n') || 'No structure information available'}

## Configuration

For detailed configuration options, please refer to the project documentation.
`;
  }

  private async generateDocumentation(projectDir: string, blueprint: Blueprint): Promise<void> {
    const docsDir = join(projectDir, 'docs');
    await mkdir(docsDir, { recursive: true });

    const docs = {
      'architecture.md': this.generateArchitectureDoc(blueprint),
      'api.md': this.generateApiDoc(blueprint),
      'deployment.md': this.generateDeploymentDoc(blueprint)
    };

    for (const [filename, content] of Object.entries(docs)) {
      await writeFile(join(docsDir, filename), content);
    }
  }

  private generateArchitectureDoc(blueprint: Blueprint): string {
    return `# Architecture Documentation

${blueprint.aiAnalysis.content}

## Project Structure
${blueprint.aiAnalysis.suggestions?.join('\n') || ''}

## Technical Decisions
${blueprint.aiAnalysis.metadata?.technicalDecisions || 'No technical decisions documented'}
`;
  }

  private generateApiDoc(blueprint: Blueprint): string {
    return `# API Documentation

This document describes the API endpoints available in the project.

${blueprint.aiAnalysis.metadata?.apiDocumentation || 'No API documentation available'}
`;
  }

  private generateDeploymentDoc(blueprint: Blueprint): string {
    const { techStack } = blueprint.configuration;
    return `# Deployment Guide

This project is configured for deployment on ${techStack?.deployment?.platform || 'the specified platform'}.

## Prerequisites
${blueprint.aiAnalysis.metadata?.deploymentPrerequisites || '- Node.js\n- npm/yarn'}

## Deployment Steps
${blueprint.aiAnalysis.metadata?.deploymentSteps || '1. Build the project\n2. Deploy to platform'}
`;
  }
} 