import { ScaffoldingService } from '../scaffolding-service';
import { createProject, type ProjectConfig } from '../../models/project';
import { type Blueprint } from '../../models/blueprint';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

// Mock fs/promises
jest.mock('fs/promises');

describe('ScaffoldingService', () => {
  let service: ScaffoldingService;
  let mockBlueprint: Blueprint;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock project configuration
    const mockProjectConfig: ProjectConfig = {
      name: 'test-project',
      description: 'Test project',
      version: '1.0.0',
      type: 'full-stack',
      category: 'web-app',
      features: ['authentication', 'api'],
      techStack: {
        frontend: {
          framework: 'next',
          styling: 'tailwind',
          stateManagement: 'redux',
        },
        backend: {
          framework: 'express',
          database: 'postgresql',
          caching: 'redis',
          authentication: 'jwt',
        },
        deployment: {
          platform: 'aws',
          containerization: 'docker',
          orchestration: 'kubernetes',
        },
      },
    };

    // Create mock blueprint
    mockBlueprint = {
      metadata: {
        projectId: '123',
        generatedAt: new Date().toISOString(),
        aiAnalysis: {
          content: 'AI analysis',
          suggestions: ['Suggestion 1'],
          metadata: { key: 'value' },
        },
      },
      template: 'next-express',
      components: {
        'pages/index.tsx': 'export default function Home() { return <div>Hello</div> }',
        'components/Button.tsx': 'export const Button = () => <button>Click me</button>',
      },
      configuration: mockProjectConfig,
    };

    // Initialize service
    service = new ScaffoldingService('/output');
  });

  describe('scaffoldProject', () => {
    it('should create project directory and files', async () => {
      await service.scaffoldProject(mockBlueprint);

      // Check if project directory was created
      expect(mkdir).toHaveBeenCalledWith(
        join('/output', mockBlueprint.configuration.name),
        { recursive: true }
      );

      // Check if package.json was created
      expect(writeFile).toHaveBeenCalledWith(
        join('/output', mockBlueprint.configuration.name, 'package.json'),
        expect.stringContaining(mockBlueprint.configuration.name)
      );

      // Check if component files were created
      for (const [path, content] of Object.entries(mockBlueprint.components)) {
        expect(writeFile).toHaveBeenCalledWith(
          join('/output', mockBlueprint.configuration.name, path),
          content
        );
      }

      // Check if configuration files were created
      const configFiles = [
        'tsconfig.json',
        '.eslintrc.json',
        '.prettierrc',
        'jest.config.js',
        'next.config.js',
      ];

      for (const file of configFiles) {
        expect(writeFile).toHaveBeenCalledWith(
          join('/output', mockBlueprint.configuration.name, file),
          expect.any(String)
        );
      }

      // Check if documentation was created
      const docFiles = ['README.md', 'ARCHITECTURE.md', 'API.md'];

      for (const file of docFiles) {
        expect(writeFile).toHaveBeenCalledWith(
          join('/output', mockBlueprint.configuration.name, 'docs', file),
          expect.any(String)
        );
      }
    });

    it('should handle file system errors', async () => {
      // Mock file system error
      (mkdir as jest.Mock).mockRejectedValue(new Error('File system error'));

      await expect(service.scaffoldProject(mockBlueprint)).rejects.toThrow('File system error');
    });
  });

  describe('configuration generation', () => {
    it('should generate correct package.json dependencies', async () => {
      await service.scaffoldProject(mockBlueprint);

      const packageJsonCall = (writeFile as jest.Mock).mock.calls.find(call =>
        call[0].endsWith('package.json')
      );

      const packageJson = JSON.parse(packageJsonCall[1]);

      // Check dependencies
      expect(packageJson.dependencies).toHaveProperty('next');
      expect(packageJson.dependencies).toHaveProperty('react');
      expect(packageJson.dependencies).toHaveProperty('react-dom');
      expect(packageJson.dependencies).toHaveProperty('tailwindcss');
      expect(packageJson.dependencies).toHaveProperty('@reduxjs/toolkit');
      expect(packageJson.dependencies).toHaveProperty('express');

      // Check dev dependencies
      expect(packageJson.devDependencies).toHaveProperty('typescript');
      expect(packageJson.devDependencies).toHaveProperty('jest');
      expect(packageJson.devDependencies).toHaveProperty('eslint');
    });

    it('should generate correct tsconfig.json', async () => {
      await service.scaffoldProject(mockBlueprint);

      const tsConfigCall = (writeFile as jest.Mock).mock.calls.find(call =>
        call[0].endsWith('tsconfig.json')
      );

      const tsConfig = JSON.parse(tsConfigCall[1]);

      expect(tsConfig.compilerOptions).toHaveProperty('target', 'ES2022');
      expect(tsConfig.compilerOptions).toHaveProperty('strict', true);
      expect(tsConfig.compilerOptions.paths).toHaveProperty('@/*');
    });
  });

  describe('documentation generation', () => {
    it('should generate README with correct content', async () => {
      await service.scaffoldProject(mockBlueprint);

      const readmeCall = (writeFile as jest.Mock).mock.calls.find(call =>
        call[0].endsWith('README.md')
      );

      const readme = readmeCall[1];

      expect(readme).toContain(mockBlueprint.configuration.name);
      expect(readme).toContain(mockBlueprint.configuration.description);
      expect(readme).toContain('Tech Stack');
      expect(readme).toContain('Getting Started');
    });

    it('should generate architecture documentation', async () => {
      await service.scaffoldProject(mockBlueprint);

      const architectureCall = (writeFile as jest.Mock).mock.calls.find(call =>
        call[0].endsWith('ARCHITECTURE.md')
      );

      const architecture = architectureCall[1];

      expect(architecture).toContain('System Architecture');
      expect(architecture).toContain('Frontend Architecture');
      expect(architecture).toContain('Backend Architecture');
    });
  });
}); 