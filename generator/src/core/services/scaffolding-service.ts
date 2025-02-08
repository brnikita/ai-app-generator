import { mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { Blueprint } from '../models/blueprint';
import { Template } from '../models/template';

export class ScaffoldingService {
  private outputDir: string;

  constructor(outputDir: string) {
    this.outputDir = outputDir;
  }

  /**
   * Scaffold a new project from a blueprint
   */
  async scaffoldProject(blueprint: Blueprint): Promise<void> {
    const projectDir = join(this.outputDir, blueprint.configuration.name);

    // Create project directory
    await mkdir(projectDir, { recursive: true });

    // Generate package.json
    await this.generatePackageJson(projectDir, blueprint);

    // Generate component files
    await this.generateComponents(projectDir, blueprint);

    // Generate configuration files
    await this.generateConfigFiles(projectDir, blueprint);

    // Generate documentation
    await this.generateDocumentation(projectDir, blueprint);
  }

  /**
   * Generate package.json with project dependencies
   */
  private async generatePackageJson(projectDir: string, blueprint: Blueprint): Promise<void> {
    const packageJson = {
      name: blueprint.configuration.name,
      version: blueprint.configuration.version,
      description: blueprint.configuration.description,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        test: 'jest',
        lint: 'eslint .',
      },
      dependencies: this.getDependencies(blueprint),
      devDependencies: this.getDevDependencies(blueprint),
    };

    await writeFile(
      join(projectDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
  }

  /**
   * Generate component files from blueprint
   */
  private async generateComponents(projectDir: string, blueprint: Blueprint): Promise<void> {
    for (const [path, content] of Object.entries(blueprint.components)) {
      const filePath = join(projectDir, path);
      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, content);
    }
  }

  /**
   * Generate configuration files (tsconfig.json, .eslintrc, etc.)
   */
  private async generateConfigFiles(projectDir: string, blueprint: Blueprint): Promise<void> {
    const configFiles = {
      'tsconfig.json': this.getTsConfig(),
      '.eslintrc.json': this.getEslintConfig(),
      '.prettierrc': this.getPrettierConfig(),
      'jest.config.js': this.getJestConfig(blueprint.configuration.name),
      'next.config.js': this.getNextConfig(),
    };

    for (const [filename, content] of Object.entries(configFiles)) {
      await writeFile(join(projectDir, filename), content);
    }
  }

  /**
   * Generate project documentation
   */
  private async generateDocumentation(projectDir: string, blueprint: Blueprint): Promise<void> {
    const docs = {
      'README.md': this.generateReadme(blueprint),
      'ARCHITECTURE.md': this.generateArchitectureDoc(blueprint),
      'API.md': this.generateApiDoc(blueprint),
    };

    await mkdir(join(projectDir, 'docs'), { recursive: true });
    
    for (const [filename, content] of Object.entries(docs)) {
      await writeFile(join(projectDir, 'docs', filename), content);
    }
  }

  /**
   * Get project dependencies based on configuration
   */
  private getDependencies(blueprint: Blueprint): Record<string, string> {
    const deps: Record<string, string> = {
      'next': '^14.0.0',
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
    };

    const { techStack } = blueprint.configuration;

    // Add frontend dependencies
    if (techStack.frontend.styling === 'tailwind') {
      deps['tailwindcss'] = '^3.3.0';
      deps['@tailwindcss/forms'] = '^0.5.0';
    }

    if (techStack.frontend.stateManagement === 'redux') {
      deps['@reduxjs/toolkit'] = '^2.0.0';
      deps['react-redux'] = '^9.0.0';
    }

    // Add backend dependencies
    if (techStack.backend.framework === 'express') {
      deps['express'] = '^4.18.0';
      deps['cors'] = '^2.8.5';
      deps['helmet'] = '^7.1.0';
    }

    return deps;
  }

  /**
   * Get project dev dependencies based on configuration
   */
  private getDevDependencies(blueprint: Blueprint): Record<string, string> {
    return {
      '@types/node': '^20.0.0',
      '@types/react': '^18.2.0',
      '@types/react-dom': '^18.2.0',
      '@typescript-eslint/eslint-plugin': '^6.0.0',
      '@typescript-eslint/parser': '^6.0.0',
      'eslint': '^8.0.0',
      'eslint-config-next': '^14.0.0',
      'eslint-config-prettier': '^9.0.0',
      'prettier': '^3.0.0',
      'typescript': '^5.0.0',
      'jest': '^29.0.0',
      '@types/jest': '^29.0.0',
      'ts-jest': '^29.0.0',
    };
  }

  /**
   * Generate TypeScript configuration
   */
  private getTsConfig(): string {
    return JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          lib: ['dom', 'dom.iterable', 'esnext'],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: 'esnext',
          moduleResolution: 'bundler',
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: 'preserve',
          incremental: true,
          plugins: [
            {
              name: 'next',
            },
          ],
          paths: {
            '@/*': ['./src/*'],
          },
        },
        include: ['next-env.d.ts', '**/*.ts', '**/*.tsx'],
        exclude: ['node_modules'],
      },
      null,
      2
    );
  }

  /**
   * Generate ESLint configuration
   */
  private getEslintConfig(): string {
    return JSON.stringify(
      {
        extends: [
          'next/core-web-vitals',
          'eslint:recommended',
          'plugin:@typescript-eslint/recommended',
          'prettier',
        ],
        rules: {
          '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
          '@typescript-eslint/no-explicit-any': 'warn',
        },
      },
      null,
      2
    );
  }

  /**
   * Generate Prettier configuration
   */
  private getPrettierConfig(): string {
    return JSON.stringify(
      {
        semi: true,
        trailingComma: 'es5',
        singleQuote: true,
        printWidth: 100,
        tabWidth: 2,
        useTabs: false,
      },
      null,
      2
    );
  }

  /**
   * Generate Jest configuration
   */
  private getJestConfig(projectName: string): string {
    return `module.exports = {
      preset: 'ts-jest',
      testEnvironment: 'node',
      roots: ['<rootDir>/src'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
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
   * Generate Next.js configuration
   */
  private getNextConfig(): string {
    return `/** @type {import('next').NextConfig} */
    const nextConfig = {
      reactStrictMode: true,
      poweredByHeader: false,
      eslint: {
        ignoreDuringBuilds: false,
      },
      typescript: {
        ignoreBuildErrors: false,
      },
    };
    
    module.exports = nextConfig;`;
  }

  /**
   * Generate README.md content
   */
  private generateReadme(blueprint: Blueprint): string {
    return `# ${blueprint.configuration.name}

${blueprint.configuration.description}

## Tech Stack

### Frontend
- Framework: ${blueprint.configuration.techStack.frontend.framework}
- Styling: ${blueprint.configuration.techStack.frontend.styling}
- State Management: ${blueprint.configuration.techStack.frontend.stateManagement}

### Backend
- Framework: ${blueprint.configuration.techStack.backend.framework}
- Database: ${blueprint.configuration.techStack.backend.database}
- Caching: ${blueprint.configuration.techStack.backend.caching}
- Authentication: ${blueprint.configuration.techStack.backend.authentication}

### Deployment
- Platform: ${blueprint.configuration.techStack.deployment.platform}
- Containerization: ${blueprint.configuration.techStack.deployment.containerization}
- Orchestration: ${blueprint.configuration.techStack.deployment.orchestration}

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Run development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Build for production:
   \`\`\`bash
   npm run build
   \`\`\`

## Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)

## Features

${blueprint.configuration.features.map(feature => `- ${feature}`).join('\n')}

## Testing

Run the test suite:
\`\`\`bash
npm test
\`\`\`

## License

[MIT](LICENSE)
`;
  }

  /**
   * Generate architecture documentation
   */
  private generateArchitectureDoc(blueprint: Blueprint): string {
    return `# ${blueprint.configuration.name} - Architecture Overview

## System Architecture

This application follows a modern, scalable architecture using ${blueprint.configuration.techStack.frontend.framework} for the frontend and ${blueprint.configuration.techStack.backend.framework} for the backend.

## Key Components

### Frontend Architecture
- Pages and Routing
- Component Structure
- State Management (${blueprint.configuration.techStack.frontend.stateManagement})
- API Integration
- Error Handling

### Backend Architecture
- API Routes
- Middleware Stack
- Database Schema
- Caching Strategy
- Authentication Flow

### Infrastructure
- Deployment Strategy
- Monitoring Setup
- Security Measures
- Performance Optimizations

## Data Flow

[Detailed data flow documentation]

## Security Considerations

[Security implementation details]

## Performance Optimizations

[Performance optimization strategies]
`;
  }

  /**
   * Generate API documentation
   */
  private generateApiDoc(blueprint: Blueprint): string {
    return `# ${blueprint.configuration.name} - API Documentation

## API Overview

This document outlines the available API endpoints and their usage.

## Authentication

Authentication is implemented using ${blueprint.configuration.techStack.backend.authentication}.

## Endpoints

[API endpoint documentation]

## Error Handling

[Error handling documentation]

## Rate Limiting

[Rate limiting documentation]

## API Versioning

[API versioning strategy]
`;
  }
} 