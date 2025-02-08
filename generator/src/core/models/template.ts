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
      framework: z.enum(['next', 'react']),
      styling: z.array(z.enum(['tailwind', 'styled-components', 'css-modules'])),
      stateManagement: z.array(z.enum(['redux', 'context'])),
    }).optional(),
    backend: z.object({
      framework: z.array(z.enum(['express', 'fastify'])),
      database: z.array(z.enum(['postgresql', 'mongodb'])),
      caching: z.array(z.enum(['redis'])),
      authentication: z.array(z.enum(['jwt', 'oauth'])),
    }).optional(),
    deployment: z.object({
      platforms: z.array(z.enum(['aws', 'heroku', 'digitalocean', 'vercel'])),
      containerization: z.array(z.enum(['docker'])),
      orchestration: z.array(z.enum(['kubernetes'])),
    }),
  }),
});

// Template metadata schema
export const TemplateMetadataSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  author: z.string(),
  tags: z.array(z.string()),
  dependencies: z.array(z.string()),
});

// Template structure schema
export const TemplateStructureSchema = z.object({
  root: z.string(),
  files: z.array(z.object({
    path: z.string(),
    type: z.enum(['file', 'directory']),
    template: z.string().optional(),
    variables: z.record(z.any()).optional(),
  })),
  hooks: z.object({
    preGeneration: z.array(z.string()).optional(),
    postGeneration: z.array(z.string()).optional(),
  }).optional(),
});

// Complete template schema
export const TemplateSchema = z.object({
  config: TemplateConfigSchema,
  metadata: TemplateMetadataSchema,
  structure: TemplateStructureSchema,
});

// TypeScript types derived from schemas
export type TemplateConfig = z.infer<typeof TemplateConfigSchema>;
export type TemplateMetadata = z.infer<typeof TemplateMetadataSchema>;
export type TemplateStructure = z.infer<typeof TemplateStructureSchema>;
export type Template = z.infer<typeof TemplateSchema>;

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
      author,
      tags: [],
      dependencies: [],
    },
    structure,
  };
}; 