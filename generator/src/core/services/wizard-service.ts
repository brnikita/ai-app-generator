import { ProjectConfig, Project, createProject } from '../models/project';
import { GenerationService } from './generation-service';
import { PreviewService } from './preview-service';
import { AIService } from './ai-service';
import { Blueprint } from '../models/blueprint';

export interface WizardProgress {
  step: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  message: string;
  progress?: number;
  error?: string;
}

export interface WizardResult {
  project: Project;
  blueprint: Blueprint;
  outputPath: string;
}

export class WizardService {
  private generationService: GenerationService;
  private previewService: PreviewService;
  private aiService: AIService;
  private progressCallback?: (progress: WizardProgress) => void;

  constructor(
    templatesDir: string,
    outputDir: string,
    aiApiKey: string,
    aiApiUrl?: string
  ) {
    this.generationService = new GenerationService(templatesDir, aiApiKey, aiApiUrl);
    this.previewService = new PreviewService(aiApiKey, aiApiUrl);
    this.aiService = new AIService(aiApiKey, aiApiUrl);
  }

  /**
   * Initialize the wizard service
   */
  async initialize(): Promise<void> {
    await this.generationService.initialize();
    this.updateProgress({
      step: 'initialization',
      status: 'completed',
      message: 'Wizard service initialized',
    });
  }

  /**
   * Set progress callback
   */
  setProgressCallback(callback: (progress: WizardProgress) => void): void {
    this.progressCallback = callback;
  }

  /**
   * Complete the wizard and generate project
   */
  async complete(config: ProjectConfig): Promise<WizardResult> {
    try {
      // Create project
      this.updateProgress({
        step: 'project',
        status: 'in-progress',
        message: 'Creating project configuration',
        progress: 0,
      });

      const project = createProject(config);

      this.updateProgress({
        step: 'project',
        status: 'completed',
        message: 'Project configuration created',
        progress: 20,
      });

      // Analyze requirements
      this.updateProgress({
        step: 'analysis',
        status: 'in-progress',
        message: 'Analyzing project requirements',
        progress: 20,
      });

      const analysis = await this.aiService.analyzeRequirements(config);

      this.updateProgress({
        step: 'analysis',
        status: 'completed',
        message: 'Requirements analysis completed',
        progress: 40,
      });

      // Generate blueprint
      this.updateProgress({
        step: 'blueprint',
        status: 'in-progress',
        message: 'Generating project blueprint',
        progress: 40,
      });

      const blueprint = await this.generationService.generateBlueprint(project);

      this.updateProgress({
        step: 'blueprint',
        status: 'completed',
        message: 'Project blueprint generated',
        progress: 60,
      });

      // Validate configuration
      this.updateProgress({
        step: 'validation',
        status: 'in-progress',
        message: 'Validating configuration',
        progress: 60,
      });

      const previewState = await this.previewService.updatePreview(config);
      if (!previewState.isValid) {
        throw new Error('Invalid configuration: ' + JSON.stringify(previewState.errors));
      }

      this.updateProgress({
        step: 'validation',
        status: 'completed',
        message: 'Configuration validated',
        progress: 80,
      });

      // Generate project files
      this.updateProgress({
        step: 'generation',
        status: 'in-progress',
        message: 'Generating project files',
        progress: 80,
      });

      const outputPath = await this.generationService.generateProject(blueprint);

      this.updateProgress({
        step: 'generation',
        status: 'completed',
        message: 'Project generation completed',
        progress: 100,
      });

      return {
        project,
        blueprint,
        outputPath,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      this.updateProgress({
        step: 'error',
        status: 'error',
        message: 'Project generation failed',
        error: message,
      });
      throw error;
    }
  }

  /**
   * Validate project configuration
   */
  async validate(config: Partial<ProjectConfig>): Promise<boolean> {
    const previewState = await this.previewService.updatePreview(config);
    return previewState.isValid;
  }

  /**
   * Get preview state for configuration
   */
  async getPreview(config: Partial<ProjectConfig>) {
    return this.previewService.updatePreview(config);
  }

  /**
   * Update progress callback
   */
  private updateProgress(progress: WizardProgress): void {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }
} 