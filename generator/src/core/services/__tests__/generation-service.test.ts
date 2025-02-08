import { GenerationService } from '../generation-service';
import { createProject, type ProjectConfig } from '../../models/project';
import { type Template } from '../../models/template';
import { type Blueprint } from '../../models/blueprint';
import { TemplateLoader } from '../template-loader';
import { AIService } from '../ai-service';

// Mock TemplateLoader and AIService
jest.mock('../template-loader');
jest.mock('../ai-service');

// Add proper type annotations for mocks
const MockTemplateLoader = TemplateLoader as jest.MockedClass<typeof TemplateLoader>;
const MockAIService = AIService as jest.MockedClass<typeof AIService>;

describe('GenerationService', () => {
  let service: GenerationService;
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
        'components/auth/LoginForm.tsx': 'mock template content',
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

    // Mock TemplateLoader implementation
    MockTemplateLoader.prototype.loadAllTemplates = jest.fn().mockResolvedValue([mockTemplate]);
    MockTemplateLoader.prototype.loadTemplate = jest.fn().mockResolvedValue(mockTemplate);
    MockTemplateLoader.prototype.loadTemplateFile = jest.fn().mockResolvedValue('mock file content');
    MockTemplateLoader.prototype.clearCache = jest.fn();
    MockTemplateLoader.prototype.templateExists = jest.fn().mockResolvedValue(true);
    MockTemplateLoader.prototype.listTemplates = jest.fn().mockResolvedValue(['next-express']);

    // Mock AIService implementation
    MockAIService.prototype.analyzeRequirements = jest.fn().mockResolvedValue({
      content: 'AI analysis',
      suggestions: ['Suggestion 1'],
      metadata: { key: 'value' },
    });
    MockAIService.prototype.generateComponent = jest.fn().mockResolvedValue({
      content: 'Generated component',
    });
    MockAIService.prototype.optimizeCode = jest.fn().mockResolvedValue({
      content: 'Optimized code',
    });
    MockAIService.prototype.generateDocumentation = jest.fn().mockResolvedValue({
      content: 'Generated documentation',
    });

    // Initialize service with mocks
    service = new GenerationService('templates', 'test-api-key');
  });

  describe('initialize', () => {
    it('should load and register all templates', async () => {
      await service.initialize();
      expect(service['templateLoader'].loadAllTemplates).toHaveBeenCalled();
    });
  });

  describe('registerTemplate', () => {
    it('should register a template successfully', () => {
      service.registerTemplate(mockTemplate);
      expect(service['templates'].get(mockTemplate.name)).toBe(mockTemplate);
    });
  });

  describe('getTemplate', () => {
    it('should return template from cache if available', async () => {
      service.registerTemplate(mockTemplate);
      const template = await service.getTemplate(mockTemplate.name);
      expect(template).toBe(mockTemplate);
      expect(service['templateLoader'].loadTemplate).not.toHaveBeenCalled();
    });

    it('should load template if not in cache', async () => {
      const template = await service.getTemplate(mockTemplate.name);
      expect(template).toBe(mockTemplate);
      expect(service['templateLoader'].loadTemplate).toHaveBeenCalledWith(mockTemplate.name);
    });
  });

  describe('generateBlueprint', () => {
    it('should generate blueprint successfully', async () => {
      const project = createProject(mockProjectConfig);
      const blueprint = await service.generateBlueprint(project);

      expect(blueprint).toMatchObject({
        metadata: {
          projectId: project.metadata.id,
          aiAnalysis: {
            content: 'AI analysis',
            suggestions: ['Suggestion 1'],
            metadata: { key: 'value' },
          },
        },
        template: mockTemplate.name,
        components: {
          'components/auth/LoginForm.tsx': 'Generated documentation',
        },
        configuration: mockProjectConfig,
      });

      expect(service['aiService'].analyzeRequirements).toHaveBeenCalledWith(mockProjectConfig);
      expect(service['aiService'].generateComponent).toHaveBeenCalled();
      expect(service['aiService'].optimizeCode).toHaveBeenCalled();
      expect(service['aiService'].generateDocumentation).toHaveBeenCalled();
    });

    it('should throw error if no compatible template found', async () => {
      const incompatibleConfig = {
        ...mockProjectConfig,
        techStack: {
          ...mockProjectConfig.techStack,
          frontend: {
            ...mockProjectConfig.techStack.frontend,
            framework: 'vue' as const,
          },
        },
      };

      const project = createProject(incompatibleConfig);
      await expect(service.generateBlueprint(project)).rejects.toThrow(
        'No compatible template found for project requirements'
      );
    });
  });
}); 