import React, { useState } from 'react';
import { ProjectConfig } from '../../../core/models/project';
import { PreviewService } from '../../../core/services/preview-service';
import { PreviewContainer } from '../preview/PreviewContainer';
import { ProjectTypeStep } from './steps/ProjectTypeStep';
import { TechStackStep } from './steps/TechStackStep';
import { FeaturesStep } from './steps/FeaturesStep';
import { ConfigurationStep } from './steps/ConfigurationStep';
import { SummaryStep } from './steps/SummaryStep';

interface ProjectWizardProps {
  previewService: PreviewService;
  onComplete: (config: ProjectConfig) => void;
  onCancel: () => void;
}

type WizardStep = 'type' | 'tech-stack' | 'features' | 'configuration' | 'summary';

const STEPS: WizardStep[] = ['type', 'tech-stack', 'features', 'configuration', 'summary'];

export const ProjectWizard: React.FC<ProjectWizardProps> = ({
  previewService,
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('type');
  const [config, setConfig] = useState<Partial<ProjectConfig>>({});
  const [isValid, setIsValid] = useState(false);

  const currentStepIndex = STEPS.indexOf(currentStep);

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentStepIndex + 1]);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1]);
    }
  };

  const handleUpdateConfig = (updates: Partial<ProjectConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const handleComplete = () => {
    if (isValid && isCompleteConfig(config)) {
      onComplete(config as ProjectConfig);
    }
  };

  const isCompleteConfig = (config: Partial<ProjectConfig>): config is ProjectConfig => {
    return !!(
      config.name &&
      config.description &&
      config.version &&
      config.type &&
      config.category &&
      config.features &&
      config.techStack
    );
  };

  return (
    <div className="flex h-full">
      {/* Wizard Steps */}
      <div className="w-2/3 flex flex-col bg-white rounded-l-lg shadow-lg">
        {/* Progress Bar */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((step, index) => (
              <React.Fragment key={step}>
                <div
                  className={`flex items-center ${
                    index <= currentStepIndex ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      index <= currentStepIndex
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="ml-2 text-sm font-medium">
                    {step.charAt(0).toUpperCase() + step.slice(1)}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-auto p-6">
          {currentStep === 'type' && (
            <ProjectTypeStep config={config} onUpdateConfig={handleUpdateConfig} />
          )}
          {currentStep === 'tech-stack' && (
            <TechStackStep config={config} onUpdateConfig={handleUpdateConfig} />
          )}
          {currentStep === 'features' && (
            <FeaturesStep config={config} onUpdateConfig={handleUpdateConfig} />
          )}
          {currentStep === 'configuration' && (
            <ConfigurationStep config={config} onUpdateConfig={handleUpdateConfig} />
          )}
          {currentStep === 'summary' && (
            <SummaryStep config={config} onUpdateConfig={handleUpdateConfig} />
          )}
        </div>

        {/* Navigation */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          <button
            className="btn btn-secondary"
            onClick={currentStepIndex === 0 ? onCancel : handleBack}
          >
            {currentStepIndex === 0 ? 'Cancel' : 'Back'}
          </button>
          <button
            className="btn btn-primary"
            onClick={currentStepIndex === STEPS.length - 1 ? handleComplete : handleNext}
            disabled={!isValid}
          >
            {currentStepIndex === STEPS.length - 1 ? 'Create Project' : 'Next'}
          </button>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="w-1/3 border-l border-gray-200">
        <PreviewContainer
          config={config}
          previewService={previewService}
          onValidationChange={setIsValid}
        />
      </div>
    </div>
  );
}; 