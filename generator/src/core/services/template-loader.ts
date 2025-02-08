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
  }

  /**
   * Load a template by name
   */
  async loadTemplate(name: string): Promise<Template> {
    // Check cache first
    const cached = this.templateCache.get(name);
    if (cached) {
      return cached;
    }

    // Load template configuration
    const configPath = join(this.templatesDir, name, 'template.json');
    const configContent = await readFile(configPath, 'utf-8');
    const template = TemplateSchema.parse(JSON.parse(configContent));

    // Cache template
    this.templateCache.set(name, template);
    return template;
  }

  /**
   * Load all templates from the templates directory
   */
  async loadAllTemplates(): Promise<Template[]> {
    const templates: Template[] = [];
    const entries = await readFile(join(this.templatesDir, 'index.json'), 'utf-8');
    const templateList = z.array(z.string()).parse(JSON.parse(entries));

    for (const name of templateList) {
      const template = await this.loadTemplate(name);
      templates.push(template);
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