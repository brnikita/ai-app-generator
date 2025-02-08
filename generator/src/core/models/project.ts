import { z } from 'zod';

export type ProjectType = 'web-app' | 'api' | 'landing-page' | 'dashboard' | 'e-commerce';
export type ProjectCategory = 'web' | 'backend';

// Tech stack types
export interface TechStack {
  frontend: {
    framework: 'react';
    styling: 'tailwind';
    stateManagement: 'redux';
  };
  backend: {
    framework: 'express';
    database: 'postgresql';
    caching: 'redis';
    auth: 'jwt';
  };
  deployment: {
    platform: 'aws';
    containerization: 'docker';
    ci: 'github-actions';
  };
}

export interface ProjectConfig {
  type: ProjectType;
  category: ProjectCategory;
  name: string;
  description: string;
  features: ProjectFeature[];
  techStack: TechStack;
}

export type ProjectFeature =
  | 'authentication'
  | 'authorization'
  | 'database'
  | 'api'
  | 'file-upload'
  | 'notifications'
  | 'search'
  | 'analytics'
  | 'localization'
  | 'payment'
  | 'email'
  | 'seo'
  | 'testing'
  | 'documentation';

// Zod schemas
export const FrontendSchema = z.object({
  framework: z.literal('react'),
  styling: z.literal('tailwind'),
  stateManagement: z.literal('redux'),
});

export const BackendSchema = z.object({
  framework: z.literal('express'),
  database: z.literal('postgresql'),
  caching: z.literal('redis'),
  auth: z.literal('jwt'),
});

export const DeploymentSchema = z.object({
  platform: z.literal('aws'),
  containerization: z.literal('docker'),
  ci: z.literal('github-actions'),
});

export const TechStackSchema = z.object({
  frontend: FrontendSchema,
  backend: BackendSchema,
  deployment: DeploymentSchema,
});

export const ProjectConfigSchema = z.object({
  type: z.enum(['web-app', 'api', 'landing-page', 'dashboard', 'e-commerce']),
  category: z.enum(['web', 'backend']),
  name: z.string(),
  description: z.string(),
  features: z.array(z.enum([
    'authentication',
    'authorization',
    'database',
    'api',
    'file-upload',
    'notifications',
    'search',
    'analytics',
    'localization',
    'payment',
    'email',
    'seo',
    'testing',
    'documentation',
  ])),
  techStack: TechStackSchema,
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

export type ProjectMetadata = z.infer<typeof ProjectMetadataSchema>;
export type Project = z.infer<typeof ProjectSchema>;

// Project factory function
export const createProject = (config: ProjectConfig): Project => {
  const metadata: ProjectMetadata = {
    id: Math.random().toString(36).substring(2, 15),
    createdAt: new Date(),
    updatedAt: new Date(),
    version: '0.1.0',
    generatedBy: 'ai-crm-generator',
  };

  return {
    config,
    metadata,
  };
}; 