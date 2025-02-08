import { z } from 'zod';

// Project configuration schema
export const ProjectConfigSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  type: z.enum(['web-app', 'admin-dashboard', 'landing-page', 'e-commerce']),
  features: z.array(z.string()),
  techStack: z.object({
    frontend: z.object({
      framework: z.enum(['next', 'react']),
      styling: z.enum(['tailwind', 'styled-components', 'css-modules']),
      stateManagement: z.enum(['redux', 'context', 'none']),
    }),
    backend: z.object({
      framework: z.enum(['express', 'fastify']),
      database: z.enum(['postgresql', 'mongodb']),
      caching: z.enum(['redis', 'none']),
      authentication: z.enum(['jwt', 'oauth', 'none']),
    }),
    deployment: z.object({
      platform: z.enum(['aws', 'heroku', 'digitalocean', 'vercel']),
      containerization: z.enum(['docker', 'none']),
      orchestration: z.enum(['kubernetes', 'none']),
    }),
  }),
});

// Project metadata schema
export const ProjectMetadataSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  status: z.enum(['draft', 'generating', 'completed', 'failed']),
  owner: z.string(),
  version: z.string(),
});

// Complete project schema
export const ProjectSchema = z.object({
  config: ProjectConfigSchema,
  metadata: ProjectMetadataSchema,
  blueprint: z.record(z.any()).optional(),
  generatedFiles: z.array(z.string()).optional(),
});

// TypeScript types derived from schemas
export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;
export type ProjectMetadata = z.infer<typeof ProjectMetadataSchema>;
export type Project = z.infer<typeof ProjectSchema>;

// Project factory function
export const createProject = (
  config: ProjectConfig,
  owner: string
): Project => {
  const now = new Date();
  return {
    config,
    metadata: {
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      status: 'draft',
      owner,
      version: '1.0.0',
    },
  };
}; 