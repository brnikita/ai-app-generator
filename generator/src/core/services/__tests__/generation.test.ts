import { GenerationService } from '../generation';
import { createProject, type Project, type ProjectConfig } from '../../models/project';
import { createTemplate, type Template, type TemplateConfig } from '../../models/template';

describe('GenerationService', () => {
  let service: GenerationService;
  let mockProject: Project;
  let mockTemplate: Template;

  beforeEach(() => {
    service = new GenerationService();

    // Create mock project configuration
    const projectConfig: ProjectConfig = {
      name: 'test-project',
      description: 'Test project',
      type: 'web-app',
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

    // Create mock project
    mockProject = createProject(projectConfig, 'test-user');

    // Create mock template configuration
    const templateConfig: TemplateConfig = {
      name: 'web-app-template',
      description: 'Web application template',
      version: '1.0.0',
      type: 'full-stack',
      category: 'web-app',
      techStack: {
        frontend: {
          framework: 'next',
          styling: ['tailwind'],
          stateManagement: ['redux'],
        },
        backend: {
          framework: ['express'],
          database: ['postgresql'],
          caching: ['redis'],
          authentication: ['jwt'],
        },
        deployment: {
          platforms: ['aws'],
          containerization: ['docker'],
          orchestration: ['kubernetes'],
        },
      },
    };

    // Create mock template
    mockTemplate = createTemplate(
      templateConfig,
      'test-author',
      {
        root: '/',
        files: [
          {
            path: 'pages/index.tsx',
            type: 'file',
            template: 'index-template',
            variables: {},
          },
          {
            path: 'components/',
            type: 'directory',
          },
        ],
      }
    );
  });

  describe('registerTemplate', () => {
    it('should register a template successfully', async () => {
      await service.registerTemplate(mockTemplate);
      const template = await service.getTemplate(mockTemplate.config.name);
      expect(template).toBeDefined();
      expect(template?.config.name).toBe(mockTemplate.config.name);
    });
  });

  describe('generateBlueprint', () => {
    beforeEach(async () => {
      await service.registerTemplate(mockTemplate);
    });

    it('should generate a blueprint for a valid project', async () => {
      const blueprint = await service.generateBlueprint(mockProject);
      expect(blueprint).toBeDefined();
      expect(blueprint.metadata.projectId).toBe(mockProject.metadata.id);
      expect(blueprint.projectConfig).toEqual(mockProject.config);
    });

    it('should throw error when no suitable template is found', async () => {
      const invalidProject = createProject(
        {
          ...mockProject.config,
          type: 'admin-dashboard',
        },
        'test-user'
      );

      await expect(service.generateBlueprint(invalidProject)).rejects.toThrow(
        'No suitable template found'
      );
    });
  });
}); 