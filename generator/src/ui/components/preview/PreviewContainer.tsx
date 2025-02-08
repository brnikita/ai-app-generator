import React, { useEffect, useState } from 'react';
import { ProjectConfig } from '../../../core/models/project';
import { Template } from '../../../core/models/template';
import { PreviewService, PreviewState } from '../../../core/services/preview-service';
import { ConfigurationPreview } from './ConfigurationPreview';
import { ComponentPreview } from './ComponentPreview';
import { ValidationSummary } from './ValidationSummary';
import { DependencyList } from './DependencyList';

interface PreviewContainerProps {
  config: Partial<ProjectConfig>;
  template?: Template;
  previewService: PreviewService;
  onValidationChange?: (isValid: boolean) => void;
}

export const PreviewContainer: React.FC<PreviewContainerProps> = ({
  config,
  template,
  previewService,
  onValidationChange,
}) => {
  const [previewState, setPreviewState] = useState<PreviewState | null>(null);
  const [activeTab, setActiveTab] = useState<'components' | 'configuration' | 'dependencies'>('components');
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  useEffect(() => {
    const updatePreview = async () => {
      try {
        const newState = await previewService.updatePreview(config, template);
        setPreviewState(newState);
        onValidationChange?.(newState.isValid);
      } catch (error) {
        console.error('Failed to update preview:', error);
      }
    };

    updatePreview();
  }, [config, template, previewService, onValidationChange]);

  if (!previewState) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Validation Summary */}
      <ValidationSummary
        isValid={previewState.isValid}
        errors={previewState.errors}
        warnings={previewState.warnings}
        suggestions={previewState.suggestions}
      />

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-4 py-2 ${
            activeTab === 'components' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('components')}
        >
          Components
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === 'configuration' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('configuration')}
        >
          Configuration
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === 'dependencies' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('dependencies')}
        >
          Dependencies
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'components' && (
          <ComponentPreview
            components={previewState.preview.components}
            selectedComponent={selectedComponent}
            onSelectComponent={setSelectedComponent}
          />
        )}
        {activeTab === 'configuration' && (
          <ConfigurationPreview configuration={previewState.preview.configuration} />
        )}
        {activeTab === 'dependencies' && (
          <DependencyList dependencies={previewState.preview.dependencies} />
        )}
      </div>
    </div>
  );
}; 