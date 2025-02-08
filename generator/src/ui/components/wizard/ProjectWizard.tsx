import React, { useState } from 'react';
import { ProjectConfig } from '../../../core/models/project';
import { PreviewService } from '../../../core/services/preview-service';
import { ProjectTypeStep } from './steps/ProjectTypeStep';
import { FeaturesStep } from './steps/FeaturesStep';

interface ProjectWizardProps {
  previewService: PreviewService;
  onComplete: (config: ProjectConfig) => void;
  onCancel: () => void;
}

type WizardStep = 'type' | 'features';

const STEPS: WizardStep[] = ['type', 'features'];

export const ProjectWizard: React.FC<ProjectWizardProps> = ({
  previewService,
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('type');
  const [config, setConfig] = useState<Partial<ProjectConfig>>({
    techStack: {
      frontend: {
        framework: 'react',
        styling: 'tailwind',
        stateManagement: 'redux'
      },
      backend: {
        framework: 'express',
        database: 'postgresql',
        caching: 'redis',
        auth: 'jwt'
      },
      deployment: {
        platform: 'aws',
        containerization: 'docker',
        ci: 'github-actions'
      }
    }
  });

  const handleNext = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1]);
    } else if (isCompleteConfig(config)) {
      onComplete(config);
    }
  };

  const handleBack = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  };

  const handleUpdateConfig = (updates: Partial<ProjectConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const isCompleteConfig = (config: Partial<ProjectConfig>): config is ProjectConfig => {
    return !!(
      config.type &&
      config.category &&
      config.name &&
      config.description &&
      config.features &&
      config.techStack
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'type':
        return <ProjectTypeStep config={config} onUpdateConfig={handleUpdateConfig} />;
      case 'features':
        return <FeaturesStep config={config} onUpdateConfig={handleUpdateConfig} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg">
      {/* Progress Steps */}
      <div className="p-4 border-b border-gray-200">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {STEPS.map((step, index) => (
              <li
                key={step}
                className={`${
                  index !== STEPS.length - 1 ? 'flex-1' : ''
                } relative`}
              >
                <div className="flex items-center">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      STEPS.indexOf(currentStep) >= index
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      STEPS.indexOf(currentStep) >= index
                        ? 'text-blue-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.charAt(0).toUpperCase() + step.slice(1)}
                  </span>
                </div>
                {index !== STEPS.length - 1 && (
                  <div className="flex-1 ml-4">
                    <div className="h-0.5 bg-gray-200"></div>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Step Content */}
      <div className="p-8">{renderStep()}</div>

      {/* Navigation */}
      <div className="px-8 py-4 bg-gray-50 rounded-b-lg flex justify-between">
        <button
          type="button"
          onClick={currentStep === 'type' ? onCancel : handleBack}
          className="btn btn-secondary"
        >
          {currentStep === 'type' ? 'Cancel' : 'Back'}
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="btn btn-primary"
        >
          {STEPS.indexOf(currentStep) === STEPS.length - 1 ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  );
};