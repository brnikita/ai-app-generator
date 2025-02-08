import { AIService } from '../ai-service';
import { createProject, type ProjectConfig } from '../../models/project';

// Mock fetch globally
global.fetch = jest.fn();

describe('AIService', () => {
  let service: AIService;
  let mockProjectConfig: ProjectConfig;

  beforeEach(() => {
    service = new AIService('test-api-key');
    
    // Reset fetch mock
    (global.fetch as jest.Mock).mockReset();

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

    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        content: [
          {
            text: 'Mock AI response',
            suggestions: ['Suggestion 1', 'Suggestion 2'],
            metadata: { key: 'value' },
          },
        ],
      }),
    });
  });

  describe('analyzeRequirements', () => {
    it('should analyze project requirements successfully', async () => {
      const response = await service.analyzeRequirements(mockProjectConfig);
      
      expect(response).toEqual({
        content: 'Mock AI response',
        suggestions: ['Suggestion 1', 'Suggestion 2'],
        metadata: { key: 'value' },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'x-api-key': 'test-api-key',
          }),
          body: expect.any(String),
        })
      );
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(service.analyzeRequirements(mockProjectConfig)).rejects.toThrow(
        'AI API error: Internal Server Error'
      );
    });
  });

  describe('generateComponent', () => {
    it('should generate component code successfully', async () => {
      const response = await service.generateComponent(
        'template code',
        { prop: 'value' },
        'component'
      );

      expect(response).toEqual({
        content: 'Mock AI response',
        suggestions: ['Suggestion 1', 'Suggestion 2'],
        metadata: { key: 'value' },
      });
    });
  });

  describe('optimizeCode', () => {
    it('should optimize code successfully', async () => {
      const response = await service.optimizeCode(
        'code to optimize',
        'optimization context'
      );

      expect(response).toEqual({
        content: 'Mock AI response',
        suggestions: ['Suggestion 1', 'Suggestion 2'],
        metadata: { key: 'value' },
      });
    });
  });

  describe('generateDocumentation', () => {
    it('should generate documentation successfully', async () => {
      const response = await service.generateDocumentation(
        'code to document',
        'component'
      );

      expect(response).toEqual({
        content: 'Mock AI response',
        suggestions: ['Suggestion 1', 'Suggestion 2'],
        metadata: { key: 'value' },
      });
    });
  });

  describe('suggestTests', () => {
    it('should suggest test cases successfully', async () => {
      const response = await service.suggestTests(
        'code to test',
        'testing context'
      );

      expect(response).toEqual({
        content: 'Mock AI response',
        suggestions: ['Suggestion 1', 'Suggestion 2'],
        metadata: { key: 'value' },
      });
    });
  });
}); 