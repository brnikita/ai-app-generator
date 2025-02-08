import { z } from 'zod';

// Tech stack schemas
export const FrontendSchema = z.object({
  framework: z.string(),
});

export const BackendSchema = z.object({
  framework: z.string(),
});

export const DeploymentSchema = z.object({
  platform: z.string().default('vercel'),
});

export const TechStackSchema = z.object({
  frontend: FrontendSchema,
  backend: BackendSchema,
  deployment: DeploymentSchema,
});

// Project configuration schema
export const ProjectConfigSchema = z.object({
  type: z.enum(['frontend', 'backend', 'full-stack', 'infrastructure']),
  name: z.string(),
  description: z.string(),
  version: z.string(),
  features: z.array(z.string()),
  category: z.enum(['web-app', 'admin-dashboard', 'landing-page', 'e-commerce']),
  techStack: TechStackSchema,
  configuration: z.record(z.string(), z.record(z.string(), z.any())).optional(),
  dependencies: z.record(z.string(), z.string()).optional(),
  devDependencies: z.record(z.string(), z.string()).optional(),
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

// TypeScript types
export type Frontend = z.infer<typeof FrontendSchema>;
export type Backend = z.infer<typeof BackendSchema>;
export type Deployment = z.infer<typeof DeploymentSchema>;
export type TechStack = z.infer<typeof TechStackSchema>;
export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;
export type ProjectMetadata = z.infer<typeof ProjectMetadataSchema>;
export type Project = z.infer<typeof ProjectSchema>;

// Project factory function
export const createProject = (config: ProjectConfig): ProjectConfig => {
  return {
    ...config,
    version: config.version || '0.1.0',
    dependencies: config.dependencies || {},
    devDependencies: config.devDependencies || {},
  };
}; 