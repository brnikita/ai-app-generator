import { z } from 'zod';

// Template configuration schema
export const TemplateConfigSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  version: z.string(),
  type: z.enum(['frontend', 'backend', 'full-stack', 'infrastructure']),
  category: z.enum(['web-app', 'admin-dashboard', 'landing-page', 'e-commerce']),
  techStack: z.object({
    frontend: z.object({
      framework: z.enum(['next', 'react', 'vue', 'angular']),
      styling: z.enum(['tailwind', 'scss', 'styled-components']).optional(),
      stateManagement: z.enum(['redux', 'mobx', 'zustand']).optional(),
    }).optional(),
    backend: z.object({
      framework: z.enum(['express', 'nest', 'fastify', 'koa']),
      database: z.enum(['postgresql', 'mongodb', 'mysql']).optional(),
      caching: z.enum(['redis', 'memcached']).optional(),
      authentication: z.enum(['jwt', 'oauth', 'session']).optional(),
    }).optional(),
    deployment: z.object({
      platform: z.enum(['aws', 'gcp', 'azure', 'vercel']).optional(),
      containerization: z.enum(['docker', 'podman']).optional(),
      orchestration: z.enum(['kubernetes', 'docker-compose']).optional(),
    }),
  }),
});

// Template metadata schema
export const TemplateMetadataSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  version: z.string(),
  projectId: z.string(),
  generatedBy: z.string(),
});

// Template structure schema
export const TemplateStructureSchema = z.object({
  files: z.array(z.object({
    type: z.enum(['file', 'directory']),
    path: z.string(),
    template: z.string().optional(),
    variables: z.record(z.any()).optional(),
  })),
  root: z.string(),
  hooks: z.object({
    preGeneration: z.array(z.string()).optional(),
    postGeneration: z.array(z.string()).optional(),
  }).optional(),
});

// Template compatibility schema
export const TemplateCompatibilitySchema = z.object({
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
  features: z.array(z.string()),
});

// Complete template schema
export const TemplateSchema = z.object({
  name: z.string(),
  description: z.string(),
  version: z.string(),
  compatibility: TemplateCompatibilitySchema,
  files: z.record(z.string()),
  config: TemplateConfigSchema,
  metadata: TemplateMetadataSchema,
  structure: TemplateStructureSchema,
});

// TypeScript types derived from schemas
export type TemplateConfig = z.infer<typeof TemplateConfigSchema>;
export type TemplateMetadata = z.infer<typeof TemplateMetadataSchema>;
export type TemplateStructure = z.infer<typeof TemplateStructureSchema>;
export type Template = z.infer<typeof TemplateSchema>;
export type TemplateCompatibility = z.infer<typeof TemplateCompatibilitySchema>;

// Template factory function
export const createTemplate = (
  config: TemplateConfig,
  author: string,
  structure: TemplateStructure
): Template => {
  const now = new Date();
  return {
    config,
    metadata: {
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      version: config.version,
      projectId: '',
      generatedBy: author,
    },
    structure,
  };
}; 