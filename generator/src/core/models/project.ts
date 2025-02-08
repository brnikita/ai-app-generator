import { z } from 'zod';

// Project configuration schema
export const ProjectConfigSchema = z.object({
  name: z.string(),
  description: z.string(),
  version: z.string(),
  type: z.enum(['frontend', 'backend', 'full-stack', 'infrastructure']),
  category: z.enum(['web-app', 'admin-dashboard', 'landing-page', 'e-commerce']),
  techStack: z.object({
    frontend: z.object({
      framework: z.enum(['next', 'react', 'vue', 'angular']),
      styling: z.enum(['tailwind', 'scss', 'styled-components']).optional(),
      stateManagement: z.enum(['redux', 'mobx', 'zustand']).optional(),
    }),
    backend: z.object({
      framework: z.enum(['express', 'nest', 'fastify', 'koa']),
      database: z.enum(['postgresql', 'mongodb', 'mysql']).optional(),
      caching: z.enum(['redis', 'memcached']).optional(),
      authentication: z.enum(['jwt', 'oauth', 'session']).optional(),
    }),
    deployment: z.object({
      platform: z.enum(['aws', 'gcp', 'azure', 'vercel']).optional(),
      containerization: z.enum(['docker', 'podman']).optional(),
      orchestration: z.enum(['kubernetes', 'docker-compose']).optional(),
    }),
  }),
  features: z.array(z.string()),
});

// Project metadata schema
export const ProjectMetadataSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  version: z.string(),
  generatedBy: z.string(),
});

// Complete project schema
export const ProjectSchema = z.object({
  config: ProjectConfigSchema,
  metadata: ProjectMetadataSchema,
});

// TypeScript types derived from schemas
export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;
export type ProjectMetadata = z.infer<typeof ProjectMetadataSchema>;
export type Project = z.infer<typeof ProjectSchema>;

// Project factory function
export function createProject(config: ProjectConfig): Project {
  const now = new Date();
  return {
    config,
    metadata: {
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      version: '1.0.0',
      generatedBy: 'generator',
    },
  };
} 