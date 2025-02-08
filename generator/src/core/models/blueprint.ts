import { z } from 'zod';
import { ProjectConfigSchema } from './project';

// Component schema
export const ComponentSchema = z.object({
  name: z.string(),
  type: z.enum(['page', 'component', 'layout', 'api', 'model', 'service']),
  path: z.string(),
  dependencies: z.array(z.string()),
  template: z.string(),
  variables: z.record(z.any()),
});

// Route schema
export const RouteSchema = z.object({
  path: z.string(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  handler: z.string(),
  middleware: z.array(z.string()),
  auth: z.boolean(),
});

// Database schema
export const DatabaseSchema = z.object({
  models: z.array(z.object({
    name: z.string(),
    fields: z.array(z.object({
      name: z.string(),
      type: z.string(),
      required: z.boolean(),
      unique: z.boolean().optional(),
      default: z.any().optional(),
    })),
    relations: z.array(z.object({
      name: z.string(),
      type: z.enum(['one-to-one', 'one-to-many', 'many-to-many']),
      target: z.string(),
    })).optional(),
  })),
  migrations: z.array(z.string()).optional(),
});

// Blueprint structure schema
export const BlueprintStructureSchema = z.object({
  components: z.array(ComponentSchema),
  routes: z.array(RouteSchema),
  database: DatabaseSchema,
  dependencies: z.record(z.string()),
  devDependencies: z.record(z.string()),
  scripts: z.record(z.string()),
  config: z.record(z.any()),
});

// AI analysis schema
export const AIAnalysisSchema = z.object({
  content: z.string(),
  suggestions: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

// Blueprint metadata schema
export const BlueprintMetadataSchema = z.object({
  projectId: z.string(),
  generatedAt: z.string(),
  aiAnalysis: AIAnalysisSchema,
});

// Complete blueprint schema
export const BlueprintSchema = z.object({
  metadata: BlueprintMetadataSchema,
  template: z.string(),
  components: z.record(z.string()),
  configuration: ProjectConfigSchema,
  aiAnalysis: AIAnalysisSchema,
});

// TypeScript types derived from schemas
export type Component = z.infer<typeof ComponentSchema>;
export type Route = z.infer<typeof RouteSchema>;
export type Database = z.infer<typeof DatabaseSchema>;
export type BlueprintStructure = z.infer<typeof BlueprintStructureSchema>;
export type BlueprintMetadata = z.infer<typeof BlueprintMetadataSchema>;
export type AIAnalysis = z.infer<typeof AIAnalysisSchema>;
export type Blueprint = z.infer<typeof BlueprintSchema>;

// Blueprint factory function
export const createBlueprint = (
  projectId: string,
  projectConfig: z.infer<typeof ProjectConfigSchema>,
  aiAnalysis: AIAnalysis
): Blueprint => {
  const now = new Date();
  return {
    metadata: {
      projectId,
      generatedAt: now.toISOString(),
      aiAnalysis,
    },
    template: '',
    components: {},
    configuration: projectConfig,
    aiAnalysis,
  };
}; 