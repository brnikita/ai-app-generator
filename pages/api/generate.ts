import { NextApiRequest, NextApiResponse } from 'next';
import { GenerationService } from '../../generator/src/core/services/generation-service';
import { PreviewService } from '../../generator/src/core/services/preview-service';
import {
  ProjectConfig,
  ProjectType,
  ProjectCategory,
} from '../../generator/src/core/models/project';
import path from 'path';

// Types for the request body
interface GenerateWebAppRequest {
  appName: string;
  description: string;
  features?: string[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body as GenerateWebAppRequest;

    // Validate required fields
    if (!body.appName || !body.description) {
      return res.status(400).json({
        error: 'Missing required fields',
        requiredFields: ['appName', 'description'],
      });
    }

    // Create project configuration
    const projectConfig: ProjectConfig = {
      type: 'web-app' as ProjectType,
      category: 'web' as ProjectCategory,
      name: body.appName,
      description: body.description,
      features: body.features?.map(f => f as any) || [],
      techStack: {
        frontend: {
          framework: 'react',
          styling: 'tailwind',
          stateManagement: 'redux',
        },
        backend: {
          framework: 'express',
          database: 'postgresql',
          caching: 'redis',
          auth: 'jwt',
        },
        deployment: {
          platform: 'aws',
          containerization: 'docker',
          ci: 'github-actions',
        },
      },
    };

    // Initialize services
    const templatesDir = path.join(process.cwd(), 'generator', 'templates');
    const outputDir = path.join(process.cwd(), 'generated', body.appName);

    const generationService = new GenerationService(
      templatesDir,
      outputDir,
      process.env.ANTHROPIC_API_KEY || '',
      process.env.ANTHROPIC_API_URL
    );

    // Initialize generation service
    await generationService.initialize();

    // Create initial blueprint structure
    const now = new Date();
    const initialBlueprint = {
      metadata: {
        id: body.appName.toLowerCase().replace(/\s+/g, '-'),
        createdAt: now,
        updatedAt: now,
        version: '1.0.0',
        generatedBy: 'ai-web-app-generator',
      },
      config: projectConfig,
      components: [
        {
          name: 'HomePage',
          type: 'page',
          path: 'pages/index.tsx',
          dependencies: ['next', 'react'],
          template: 'next-typescript/pages/index',
          variables: {
            name: body.appName,
            description: body.description,
          },
        },
      ],
      routes: [
        {
          path: '/',
          method: 'GET',
          handler: 'pages/index.tsx',
          middleware: [],
          auth: false,
        },
      ],
      database: {
        models: [],
        migrations: [],
      },
      dependencies: {
        next: '^14.1.0',
        react: '^18.2.0',
        'react-dom': '^18.2.0',
      },
      devDependencies: {
        typescript: '^5.3.3',
        '@types/react': '^18.2.55',
        '@types/node': '^20.11.17',
      },
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
      },
    };

    // Generate the project blueprint
    const blueprint = await generationService.generateBlueprint(initialBlueprint);

    // Generate the project
    const projectPath = await generationService.generateProject(blueprint);

    return res.status(200).json({
      success: true,
      message: 'Web app generation completed',
      data: {
        projectId: blueprint.metadata.projectId,
        projectPath,
        appName: body.appName,
        description: body.description,
        features: body.features || [],
        status: 'completed',
        timestamp: now.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error generating web app:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Failed to generate web app',
    });
  }
}
