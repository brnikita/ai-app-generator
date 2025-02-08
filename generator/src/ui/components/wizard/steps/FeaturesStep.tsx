import React from 'react';
import { ProjectConfig } from '../../../../core/models/project';

interface FeaturesStepProps {
  config: Partial<ProjectConfig>;
  onUpdateConfig: (updates: Partial<ProjectConfig>) => void;
}

type Feature = {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'core' | 'auth' | 'data' | 'ui' | 'api' | 'deployment';
  dependencies?: string[];
  incompatibleWith?: string[];
};

const FEATURES: Feature[] = [
  // Core Features
  {
    id: 'routing',
    title: 'Dynamic Routing',
    description: 'Client-side routing with page transitions',
    icon: '🔀',
    category: 'core',
  },
  {
    id: 'seo',
    title: 'SEO Optimization',
    description: 'Meta tags, sitemaps, and robots.txt',
    icon: '🔍',
    category: 'core',
  },
  
  // Authentication Features
  {
    id: 'authentication',
    title: 'Authentication',
    description: 'User authentication and authorization',
    icon: '🔐',
    category: 'auth',
    dependencies: ['user-management'],
  },
  {
    id: 'oauth',
    title: 'OAuth Integration',
    description: 'Social login with popular providers',
    icon: '🔑',
    category: 'auth',
    dependencies: ['authentication'],
  },
  {
    id: 'mfa',
    title: 'Multi-Factor Auth',
    description: 'Two-factor authentication support',
    icon: '🛡️',
    category: 'auth',
    dependencies: ['authentication'],
  },
  
  // Data Features
  {
    id: 'database',
    title: 'Database Integration',
    description: 'Data persistence with ORM',
    icon: '💾',
    category: 'data',
  },
  {
    id: 'caching',
    title: 'Caching',
    description: 'Performance optimization with caching',
    icon: '⚡',
    category: 'data',
  },
  {
    id: 'search',
    title: 'Search',
    description: 'Full-text search capabilities',
    icon: '🔎',
    category: 'data',
    dependencies: ['database'],
  },
  
  // UI Features
  {
    id: 'responsive',
    title: 'Responsive Design',
    description: 'Mobile-first responsive layouts',
    icon: '📱',
    category: 'ui',
  },
  {
    id: 'dark-mode',
    title: 'Dark Mode',
    description: 'Theme switching support',
    icon: '🌙',
    category: 'ui',
  },
  {
    id: 'i18n',
    title: 'Internationalization',
    description: 'Multi-language support',
    icon: '🌍',
    category: 'ui',
  },
  
  // API Features
  {
    id: 'rest-api',
    title: 'REST API',
    description: 'RESTful API endpoints',
    icon: '🔌',
    category: 'api',
    incompatibleWith: ['graphql-api'],
  },
  {
    id: 'graphql-api',
    title: 'GraphQL API',
    description: 'GraphQL schema and resolvers',
    icon: '📊',
    category: 'api',
    incompatibleWith: ['rest-api'],
  },
  {
    id: 'websockets',
    title: 'WebSockets',
    description: 'Real-time communication',
    icon: '🔄',
    category: 'api',
  },
  
  // Deployment Features
  {
    id: 'docker',
    title: 'Docker',
    description: 'Containerized deployment',
    icon: '🐳',
    category: 'deployment',
  },
  {
    id: 'ci-cd',
    title: 'CI/CD',
    description: 'Automated deployment pipeline',
    icon: '🚀',
    category: 'deployment',
  },
  {
    id: 'monitoring',
    title: 'Monitoring',
    description: 'Performance and error tracking',
    icon: '📈',
    category: 'deployment',
  },
];

const CATEGORIES = [
  { id: 'core', title: 'Core Features', icon: '⚙️' },
  { id: 'auth', title: 'Authentication', icon: '🔐' },
  { id: 'data', title: 'Data Management', icon: '💾' },
  { id: 'ui', title: 'User Interface', icon: '🎨' },
  { id: 'api', title: 'API & Integration', icon: '🔌' },
  { id: 'deployment', title: 'Deployment', icon: '🚀' },
];

export const FeaturesStep: React.FC<FeaturesStepProps> = ({ config, onUpdateConfig }) => {
  const selectedFeatures = config.features || [];

  const handleFeatureToggle = (featureId: string) => {
    const feature = FEATURES.find(f => f.id === featureId);
    if (!feature) return;

    let newFeatures: string[];
    if (selectedFeatures.includes(featureId)) {
      // Remove feature and its dependents
      const dependents = FEATURES.filter(f => 
        f.dependencies?.includes(featureId)
      ).map(f => f.id);
      newFeatures = selectedFeatures.filter(f => 
        f !== featureId && !dependents.includes(f)
      );
    } else {
      // Add feature and its dependencies
      const dependencies = feature.dependencies || [];
      newFeatures = [...new Set([...selectedFeatures, featureId, ...dependencies])];
      
      // Remove incompatible features
      if (feature.incompatibleWith) {
        newFeatures = newFeatures.filter(f => !feature.incompatibleWith?.includes(f));
      }
    }

    onUpdateConfig({ features: newFeatures });
  };

  const isFeatureDisabled = (feature: Feature): boolean => {
    if (!feature.dependencies) return false;
    return !feature.dependencies.every(dep => selectedFeatures.includes(dep));
  };

  const isFeatureIncompatible = (feature: Feature): boolean => {
    if (!feature.incompatibleWith) return false;
    return feature.incompatibleWith.some(f => selectedFeatures.includes(f));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Project Features</h2>
        <p className="mt-1 text-sm text-gray-500">
          Select the features you want to include in your project. Some features may have dependencies
          or be incompatible with others.
        </p>
      </div>

      {CATEGORIES.map(category => {
        const categoryFeatures = FEATURES.filter(f => f.category === category.id);
        
        return (
          <div key={category.id} className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-xl">{category.icon}</span>
              <h3 className="text-lg font-medium text-gray-900">{category.title}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {categoryFeatures.map(feature => {
                const isSelected = selectedFeatures.includes(feature.id);
                const isDisabled = isFeatureDisabled(feature);
                const isIncompatible = isFeatureIncompatible(feature);

                return (
                  <button
                    key={feature.id}
                    onClick={() => handleFeatureToggle(feature.id)}
                    disabled={isDisabled || isIncompatible}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : isDisabled || isIncompatible
                        ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                        : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="text-2xl">{feature.icon}</div>
                      <div>
                        <h4 className="font-medium text-gray-900">{feature.title}</h4>
                        <p className="mt-1 text-sm text-gray-500">{feature.description}</p>
                        {(feature.dependencies || feature.incompatibleWith) && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {feature.dependencies?.map(dep => (
                              <span
                                key={dep}
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  selectedFeatures.includes(dep)
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                Requires: {dep}
                              </span>
                            ))}
                            {feature.incompatibleWith?.map(inc => (
                              <span
                                key={inc}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
                              >
                                Conflicts: {inc}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}; 