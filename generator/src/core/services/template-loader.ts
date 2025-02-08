import { readFile } from 'fs/promises';
import { join, resolve } from 'path';
import { z } from 'zod';
import { Template, TemplateSchema } from '../models/template';

// Template file schema
const TemplateFileSchema = z.object({
  content: z.string(),
  variables: z.record(z.any()).optional(),
});

export class TemplateLoader {
  private templatesDir: string;
  private templateCache: Map<string, Template>;
  private fileCache: Map<string, string>;

  constructor(templatesDir: string) {
    this.templatesDir = resolve(templatesDir);
    this.templateCache = new Map();
    this.fileCache = new Map();
    console.log('[TemplateLoader] Initialized with templates directory:', this.templatesDir);
  }

  /**
   * Load a template by name
   */
  async loadTemplate(name: string): Promise<Template> {
    console.log('[TemplateLoader] Loading template:', name);

    // Check cache first
    const cached = this.templateCache.get(name);
    if (cached) {
      console.log('[TemplateLoader] Found template in cache:', name);
      return cached;
    }

    // Load template configuration
    const configPath = join(this.templatesDir, name, 'template.json');
    console.log('[TemplateLoader] Reading template config from:', configPath);

    try {
      const configContent = await readFile(configPath, 'utf-8');
      console.log('[TemplateLoader] Successfully read template config file');

      const rawTemplate = JSON.parse(configContent);
      console.log('[TemplateLoader] Parsed template config:', JSON.stringify(rawTemplate, null, 2));

      // Convert date strings to Date objects
      if (rawTemplate.metadata) {
        console.log('[TemplateLoader] Processing metadata dates');
        if (rawTemplate.metadata.createdAt) {
          rawTemplate.metadata.createdAt = new Date(rawTemplate.metadata.createdAt);
        }
        if (rawTemplate.metadata.updatedAt) {
          rawTemplate.metadata.updatedAt = new Date(rawTemplate.metadata.updatedAt);
        }
      }

      // Add required fields if missing
      if (!rawTemplate.compatibility?.frontend?.framework) {
        console.log('[TemplateLoader] Adding missing frontend framework');
        rawTemplate.compatibility = {
          ...rawTemplate.compatibility,
          frontend: {
            ...rawTemplate.compatibility?.frontend,
            framework: 'next',
          },
        };
      }

      if (!rawTemplate.compatibility?.backend?.framework) {
        console.log('[TemplateLoader] Adding missing backend framework');
        rawTemplate.compatibility = {
          ...rawTemplate.compatibility,
          backend: {
            ...rawTemplate.compatibility?.backend,
            framework: 'express',
          },
        };
      }

      // Convert file objects to strings
      if (rawTemplate.files) {
        console.log('[TemplateLoader] Converting file objects to strings');
        Object.keys(rawTemplate.files).forEach(key => {
          if (typeof rawTemplate.files[key] === 'object') {
            rawTemplate.files[key] = rawTemplate.files[key].content;
          }
        });
      }

      // Add required structure if missing or convert existing structure
      console.log('[TemplateLoader] Processing structure field');
      const fileKeys = Object.keys(rawTemplate.files || {});

      // First, create the directory entries
      const directories = ['pages', 'styles', 'components', 'public'].map(dir => ({
        path: dir,
        type: 'directory' as const,
        children: [],
      }));

      // Then create file entries
      const files = fileKeys.map(filePath => ({
        path: filePath,
        type: 'file' as const,
        template: rawTemplate.files[filePath],
        context: {}, // Add empty context object for template variables
      }));

      rawTemplate.structure = {
        root: './', // Add required root field
        directories,
        files,
      };

      console.log(
        '[TemplateLoader] Processed structure:',
        JSON.stringify(rawTemplate.structure, null, 2)
      );
      console.log('[TemplateLoader] Validating template with schema');

      const template = TemplateSchema.parse(rawTemplate);
      console.log('[TemplateLoader] Template validation successful');

      // Cache template
      this.templateCache.set(name, template);
      return template;
    } catch (error) {
      console.error('[TemplateLoader] Error loading template:', error);
      throw error;
    }
  }

  /**
   * Load all templates from the templates directory
   */
  async loadAllTemplates(): Promise<Template[]> {
    const templates: Template[] = [];
    const entries = await readFile(join(this.templatesDir, 'index.json'), 'utf-8');
    const templateList = z
      .array(
        z.object({
          name: z.string(),
          description: z.string(),
          version: z.string(),
          path: z.string(),
          config: z.object({
            dependencies: z.record(z.string()),
            devDependencies: z.record(z.string()),
          }),
        })
      )
      .parse(JSON.parse(entries));

    for (const template of templateList) {
      const loadedTemplate = await this.loadTemplate(template.path);
      templates.push(loadedTemplate);
    }

    return templates;
  }

  /**
   * Load a template file's content
   */
  async loadTemplateFile(templateName: string, filePath: string): Promise<string> {
    const cacheKey = `${templateName}:${filePath}`;

    // Check cache first
    const cached = this.fileCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Load file content
    const fullPath = join(this.templatesDir, templateName, 'files', filePath);
    const content = await readFile(fullPath, 'utf-8');

    // Cache content
    this.fileCache.set(cacheKey, content);
    return content;
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.templateCache.clear();
    this.fileCache.clear();
  }

  /**
   * Get template directory path
   */
  getTemplateDir(templateName: string): string {
    return join(this.templatesDir, templateName);
  }

  /**
   * Check if a template exists
   */
  async templateExists(name: string): Promise<boolean> {
    try {
      await this.loadTemplate(name);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get a list of all available templates
   */
  async listTemplates(): Promise<string[]> {
    const entries = await readFile(join(this.templatesDir, 'index.json'), 'utf-8');
    return z.array(z.string()).parse(JSON.parse(entries));
  }
}
