import { PreviewService } from '../preview-service';
import { type ProjectConfig } from '../../models/project';
import { type Template } from '../../models/template';
import { AIService } from '../ai-service';

// Mock AIService
jest.mock('../ai-service');

describe('PreviewService', () => {
  let service: PreviewService;
  let mockProjectConfig: ProjectConfig;
  let mockTemplate: Template;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock project configuration
    mockProjectConfig = {
      name: 'test-project',
      description: 'Test project',
      version: '1.0.0',
      type: 'full-stack',
      category: 'web-app',
      features: ['authentication', 'api', 'database'],
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

    // Create mock template
    mockTemplate = {
      name: 'next-express',
      description: 'Next.js with Express template',
      version: '1.0.0',
      compatibility: {
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
        features: ['authentication', 'api'],
      },
      files: {
        'pages/index.tsx': 'export default function Home() { return <div>Hello</div> }',
        'components/Button.tsx': 'export const Button = () => <button>Click me</button>',
      },
      config: mockProjectConfig,
      metadata: {
        id: '123',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        projectId: '456',
        generatedBy: 'test',
      },
      structure: {
        files: [],
        root: '/',
      },
    };

    // Mock AIService implementation
    (AIService as jest.MockedClass<typeof AIService>).prototype.analyzeRequirements = jest
      .fn()
      .mockResolvedValue({
        content: 'AI analysis',
        suggestions: ['Suggestion 1'],
        metadata: { key: 'value' },
      });

    (AIService as jest.MockedClass<typeof AIService>).prototype.generateComponent = jest
      .fn()
      .mockResolvedValue({
        content: 'Generated component code',
      });

    // Initialize service
    service = new PreviewService('test-api-key');
  });

  describe('updatePreview', () => {
    it('should validate configuration and generate previews', async () => {
      const preview = await service.updatePreview(mockProjectConfig, mockTemplate);

      expect(preview.isValid).toBe(true);
      expect(preview.errors).toEqual({});
      expect(preview.warnings).toEqual({});
      expect(preview.suggestions).toEqual(['Suggestion 1']);
      expect(preview.preview.components).toBeDefined();
      expect(preview.preview.dependencies).toBeDefined();
      expect(preview.preview.configuration).toBeDefined();
    });

    it('should handle invalid configuration', async () => {
      const invalidConfig = {
        ...mockProjectConfig,
        features: ['authentication'],
        techStack: {
          ...mockProjectConfig.techStack,
          backend: {
            ...mockProjectConfig.techStack.backend,
            authentication: undefined,
          },
        },
      };

      const preview = await service.updatePreview(invalidConfig);

      expect(preview.isValid).toBe(false);
      expect(preview.errors['techStack.backend.authentication']).toBeDefined();
    });

    it('should generate warnings for incompatible tech stack', async () => {
      const config = {
        ...mockProjectConfig,
        techStack: {
          ...mockProjectConfig.techStack,
          backend: {
            ...mockProjectConfig.techStack.backend,
            framework: 'fastify' as const,
          },
        },
      };

      const preview = await service.updatePreview(config);

      expect(preview.warnings['techStack.backend.framework']).toBeDefined();
    });
  });

  describe('validation', () => {
    it('should validate feature dependencies', async () => {
      const config = {
        ...mockProjectConfig,
        features: ['database'],
        techStack: {
          ...mockProjectConfig.techStack,
          backend: {
            ...mockProjectConfig.techStack.backend,
            database: undefined,
          },
        },
      };

      const preview = await service.updatePreview(config);

      expect(preview.errors['techStack.backend.database']).toBeDefined();
    });

    it('should validate deployment configuration', async () => {
      const config = {
        ...mockProjectConfig,
        techStack: {
          ...mockProjectConfig.techStack,
          deployment: {
            ...mockProjectConfig.techStack.deployment,
            containerization: 'podman' as const,
          },
        },
      };

      const preview = await service.updatePreview(config);

      expect(preview.errors['techStack.deployment.containerization']).toBeDefined();
    });

    it('should generate warnings for Vercel deployment with full-stack', async () => {
      const config = {
        ...mockProjectConfig,
        techStack: {
          ...mockProjectConfig.techStack,
          deployment: {
            ...mockProjectConfig.techStack.deployment,
            platform: 'vercel' as const,
          },
        },
      };

      const preview = await service.updatePreview(config);

      expect(preview.warnings['techStack.deployment.platform']).toBeDefined();
    });
  });

  describe('component preview generation', () => {
    it('should generate previews for React components', async () => {
      const preview = await service.updatePreview(mockProjectConfig, mockTemplate);

      expect(preview.preview.components['pages/index.tsx']).toBeDefined();
      expect(preview.preview.components['components/Button.tsx']).toBeDefined();
      expect(AIService.prototype.generateComponent).toHaveBeenCalledTimes(2);
    });

    it('should include correct dependencies', async () => {
      const preview = await service.updatePreview(mockProjectConfig);

      expect(preview.preview.dependencies).toHaveProperty('next');
      expect(preview.preview.dependencies).toHaveProperty('react');
      expect(preview.preview.dependencies).toHaveProperty('tailwindcss');
      expect(preview.preview.dependencies).toHaveProperty('@reduxjs/toolkit');
    });

    it('should include configuration preview', async () => {
      const preview = await service.updatePreview(mockProjectConfig);

      expect(preview.preview.configuration).toEqual({
        name: mockProjectConfig.name,
        version: mockProjectConfig.version,
        type: mockProjectConfig.type,
        features: mockProjectConfig.features,
        techStack: mockProjectConfig.techStack,
      });
    });
  });
}); 