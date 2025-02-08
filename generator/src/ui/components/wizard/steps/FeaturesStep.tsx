import React from 'react';
import { ProjectConfig, ProjectFeature } from '../../../../core/models/project';

interface FeaturesStepProps {
  config: Partial<ProjectConfig>;
  onUpdateConfig: (updates: Partial<ProjectConfig>) => void;
}

interface FeatureOption {
  id: ProjectFeature;
  title: string;
  description: string;
  icon: string;
  category: 'core' | 'auth' | 'data' | 'ui' | 'api' | 'deployment';
  requires?: ProjectFeature[];
  incompatibleWith?: ProjectFeature[];
}

const FEATURES: FeatureOption[] = [
  {
    id: 'authentication',
    title: 'Authentication',
    description: 'User authentication with multiple providers',
    icon: '🔐',
    category: 'auth',
  },
  {
    id: 'authorization',
    title: 'Authorization',
    description: 'Role-based access control and permissions',
    icon: '🛡️',
    category: 'auth',
    requires: ['authentication'],
  },
  {
    id: 'database',
    title: 'Database Integration',
    description: 'Data persistence with your chosen database',
    icon: '💾',
    category: 'data',
  },
  {
    id: 'api',
    title: 'API Integration',
    description: 'RESTful or GraphQL API endpoints',
    icon: '🔌',
    category: 'api',
  },
  {
    id: 'file-upload',
    title: 'File Upload',
    description: 'File upload and storage capabilities',
    icon: '📁',
    category: 'core',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Real-time notifications and alerts',
    icon: '🔔',
    category: 'ui',
    requires: ['authentication'],
  },
  {
    id: 'search',
    title: 'Search',
    description: 'Full-text search functionality',
    icon: '🔍',
    category: 'core',
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'User behavior tracking and analytics',
    icon: '📊',
    category: 'core',
  },
  {
    id: 'localization',
    title: 'Localization',
    description: 'Multi-language support',
    icon: '🌍',
    category: 'ui',
  },
  {
    id: 'payment',
    title: 'Payment Integration',
    description: 'Payment processing capabilities',
    icon: '💳',
    category: 'core',
    requires: ['authentication'],
  },
  {
    id: 'email',
    title: 'Email Service',
    description: 'Email notifications and templates',
    icon: '📧',
    category: 'core',
  },
  {
    id: 'seo',
    title: 'SEO Optimization',
    description: 'Search engine optimization features',
    icon: '🎯',
    category: 'core',
  },
  {
    id: 'testing',
    title: 'Testing Setup',
    description: 'Unit and integration testing configuration',
    icon: '🧪',
    category: 'deployment',
  },
  {
    id: 'documentation',
    title: 'Documentation',
    description: 'API and code documentation setup',
    icon: '📚',
    category: 'deployment',
  },
];

const CATEGORIES = [
  { id: 'core', title: 'Core Features' },
  { id: 'auth', title: 'Authentication & Authorization' },
  { id: 'data', title: 'Data Management' },
  { id: 'ui', title: 'User Interface' },
  { id: 'api', title: 'API & Integration' },
  { id: 'deployment', title: 'Deployment & Testing' },
] as const;

export const FeaturesStep: React.FC<FeaturesStepProps> = ({ config, onUpdateConfig }) => {
  const selectedFeatures = config.features || [];

  const isFeatureDisabled = (feature: FeatureOption): boolean => {
    if (!feature.requires?.length) return false;
    return !feature.requires.every(req => selectedFeatures.includes(req));
  };

  const isFeatureIncompatible = (feature: FeatureOption): boolean => {
    if (!feature.incompatibleWith?.length) return false;
    return feature.incompatibleWith.some(incomp => selectedFeatures.includes(incomp));
  };

  const handleFeatureToggle = (featureId: ProjectFeature) => {
    const newFeatures = selectedFeatures.includes(featureId)
      ? selectedFeatures.filter(f => f !== featureId)
      : [...selectedFeatures, featureId];

    onUpdateConfig({ features: newFeatures });
  };

  const renderFeature = (feature: FeatureOption) => {
    const isSelected = selectedFeatures.includes(feature.id);
    const isDisabled = isFeatureDisabled(feature);
    const isIncompatible = isFeatureIncompatible(feature);

    return (
      <button
        key={feature.id}
        onClick={() => !isDisabled && !isIncompatible && handleFeatureToggle(feature.id)}
        disabled={isDisabled || isIncompatible}
        className={`relative rounded-lg border ${
          isSelected
            ? 'border-blue-500 ring-2 ring-blue-500'
            : isDisabled || isIncompatible
            ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-gray-400'
        } bg-white p-4 shadow-sm focus:outline-none w-full text-left`}
      >
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 text-xl">{feature.icon}</div>
          <div className="min-w-0 flex-1">
            <p
              className={`text-sm font-medium ${
                isSelected ? 'text-blue-600' : 'text-gray-900'
              }`}
            >
              {feature.title}
            </p>
            <p className="mt-1 text-sm text-gray-500">{feature.description}</p>
            {isDisabled && feature.requires && (
              <p className="mt-1 text-xs text-red-500">
                Requires: {feature.requires.join(', ')}
              </p>
            )}
          </div>
          {isSelected && (
            <div className="flex-shrink-0">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </div>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Choose Features</h2>
        <p className="mt-2 text-gray-600">
          Select the features you want to include in your project. Some features may require others to
          be selected first.
        </p>
      </div>

      {CATEGORIES.map(category => (
        <div key={category.id} className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">{category.title}</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FEATURES.filter(feature => feature.category === category.id).map(renderFeature)}
          </div>
        </div>
      ))}
    </div>
  );
}; 