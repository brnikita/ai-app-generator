import { readFile } from 'fs/promises';
import { join } from 'path';
import { Blueprint } from '../models/blueprint';
import { ProjectConfig } from '../models/project';

// Template syntax types
type TemplateToken = {
  type: 'text' | 'variable' | 'if' | 'for' | 'include' | 'helper';
  content: string;
  args?: string[];
  children?: TemplateToken[];
};

// Helper function types
type HelperFunction = (args: any[], context: Record<string, any>) => string;

export class TemplateService {
  private readonly templatesDir: string;
  private readonly helpers: Map<string, HelperFunction>;
  private readonly cache: Map<string, string>;

  constructor(templatesDir: string) {
    this.templatesDir = templatesDir;
    this.helpers = new Map();
    this.cache = new Map();

    // Register default helpers
    this.registerDefaultHelpers();
  }

  /**
   * Process a template with given variables
   */
  async processTemplate(
    template: string,
    variables: Record<string, any>,
    parentPath?: string
  ): Promise<string> {
    const tokens = this.parseTemplate(template);
    return this.processTokens(tokens, variables, parentPath);
  }

  /**
   * Generate component content from template
   */
  async generateComponentContent(
    componentPath: string,
    template: string,
    config: ProjectConfig
  ): Promise<string> {
    const variables = {
      projectName: config.name,
      projectType: config.type,
      projectConfig: config,
      ...config.techStack,
      helpers: {
        capitalize: (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
        lowercase: (str: string) => str.toLowerCase(),
        uppercase: (str: string) => str.toUpperCase(),
        camelCase: (str: string) => str.replace(/-([a-z])/g, g => g[1].toUpperCase()),
        kebabCase: (str: string) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
      },
    };

    return this.processTemplate(template, variables, componentPath);
  }

  /**
   * Parse template into tokens
   */
  private parseTemplate(template: string): TemplateToken[] {
    const tokens: TemplateToken[] = [];
    let current = 0;
    const length = template.length;

    while (current < length) {
      // Handle text
      if (template[current] !== '{') {
        let value = '';
        while (current < length && template[current] !== '{') {
          value += template[current];
          current++;
        }
        if (value) tokens.push({ type: 'text', content: value });
        continue;
      }

      // Handle template expressions
      if (template.substr(current, 2) === '{{') {
        const end = template.indexOf('}}', current);
        if (end === -1) throw new Error('Unclosed template expression');

        const expression = template.slice(current + 2, end).trim();
        current = end + 2;

        // Parse expression type
        if (expression.startsWith('if ')) {
          tokens.push({
            type: 'if',
            content: expression.slice(3),
            children: [],
          });
        } else if (expression.startsWith('for ')) {
          tokens.push({
            type: 'for',
            content: expression.slice(4),
            children: [],
          });
        } else if (expression.startsWith('include ')) {
          tokens.push({
            type: 'include',
            content: expression.slice(8),
          });
        } else if (expression.includes('|')) {
          const [variable, helper] = expression.split('|').map(s => s.trim());
          tokens.push({
            type: 'helper',
            content: variable,
            args: [helper],
          });
        } else {
          tokens.push({
            type: 'variable',
            content: expression,
          });
        }
        continue;
      }

      // Handle unknown characters
      tokens.push({ type: 'text', content: template[current] });
      current++;
    }

    return tokens;
  }

  /**
   * Process parsed tokens
   */
  private async processTokens(
    tokens: TemplateToken[],
    variables: Record<string, any>,
    parentPath?: string
  ): Promise<string> {
    let result = '';

    for (const token of tokens) {
      switch (token.type) {
        case 'text':
          result += token.content;
          break;

        case 'variable':
          result += this.evaluateVariable(token.content, variables);
          break;

        case 'if':
          if (this.evaluateCondition(token.content, variables) && token.children) {
            result += await this.processTokens(token.children, variables, parentPath);
          }
          break;

        case 'for':
          result += await this.processLoop(token, variables, parentPath);
          break;

        case 'include':
          result += await this.processInclude(token.content, variables, parentPath);
          break;

        case 'helper':
          result += this.processHelper(token.content, token.args || [], variables);
          break;
      }
    }

    return result;
  }

  /**
   * Evaluate a variable expression
   */
  private evaluateVariable(expression: string, variables: Record<string, any>): string {
    const parts = expression.split('.');
    let value = variables;

    for (const part of parts) {
      if (value === undefined || value === null) return '';
      value = value[part];
    }

    return value?.toString() || '';
  }

  /**
   * Evaluate a conditional expression
   */
  private evaluateCondition(condition: string, variables: Record<string, any>): boolean {
    // Simple evaluation for now - can be expanded for more complex conditions
    const parts = condition.split(/\s+(===|!==|&&|\|\|)\s+/);
    const value = this.evaluateVariable(parts[0], variables);

    if (parts.length === 1) return !!value;

    const operator = parts[1];
    const right = parts[2].startsWith('"') ? parts[2].slice(1, -1) : this.evaluateVariable(parts[2], variables);

    switch (operator) {
      case '===': return value === right;
      case '!==': return value !== right;
      case '&&': return !!value && !!right;
      case '||': return !!value || !!right;
      default: return !!value;
    }
  }

  /**
   * Process a loop expression
   */
  private async processLoop(
    token: TemplateToken,
    variables: Record<string, any>,
    parentPath?: string
  ): Promise<string> {
    if (!token.children) return '';

    const [itemName, , arrayName] = token.content.split(/\s+in\s+/);
    const array = this.evaluateVariable(arrayName, variables);

    if (!Array.isArray(array)) return '';

    let result = '';
    for (const item of array) {
      const loopVariables = {
        ...variables,
        [itemName]: item,
        loop: {
          index: array.indexOf(item),
          first: array.indexOf(item) === 0,
          last: array.indexOf(item) === array.length - 1,
        },
      };
      result += await this.processTokens(token.children, loopVariables, parentPath);
    }

    return result;
  }

  /**
   * Process an include directive
   */
  private async processInclude(
    templatePath: string,
    variables: Record<string, any>,
    parentPath?: string
  ): Promise<string> {
    const fullPath = parentPath ? join(this.templatesDir, parentPath, templatePath) : join(this.templatesDir, templatePath);

    // Check cache first
    if (this.cache.has(fullPath)) {
      return this.processTemplate(this.cache.get(fullPath)!, variables, templatePath);
    }

    try {
      const content = await readFile(fullPath, 'utf-8');
      this.cache.set(fullPath, content);
      return this.processTemplate(content, variables, templatePath);
    } catch (error) {
      console.error(`Failed to include template: ${templatePath}`, error);
      return '';
    }
  }

  /**
   * Process a helper function
   */
  private processHelper(variable: string, helperNames: string[], variables: Record<string, any>): string {
    let value = this.evaluateVariable(variable, variables);

    for (const helperName of helperNames) {
      const helper = this.helpers.get(helperName);
      if (helper) {
        value = helper([value], variables);
      }
    }

    return value;
  }

  /**
   * Register default helper functions
   */
  private registerDefaultHelpers(): void {
    this.helpers.set('uppercase', ([str]) => str.toUpperCase());
    this.helpers.set('lowercase', ([str]) => str.toLowerCase());
    this.helpers.set('capitalize', ([str]) => str.charAt(0).toUpperCase() + str.slice(1));
    this.helpers.set('join', ([arr, separator = ', ']) => arr.join(separator));
    this.helpers.set('default', ([value, defaultValue = '']) => value || defaultValue);
    this.helpers.set('json', ([value]) => JSON.stringify(value, null, 2));
  }

  /**
   * Register a custom helper function
   */
  registerHelper(name: string, fn: HelperFunction): void {
    this.helpers.set(name, fn);
  }

  /**
   * Clear the template cache
   */
  clearCache(): void {
    this.cache.clear();
  }
} 