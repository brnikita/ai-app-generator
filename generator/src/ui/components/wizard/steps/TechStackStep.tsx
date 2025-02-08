import React from 'react';
import { ProjectConfig } from '../../../../core/models/project';

interface TechStackStepProps {
  config: Partial<ProjectConfig>;
  onUpdateConfig: (updates: Partial<ProjectConfig>) => void;
}

type FrontendFramework = 'next' | 'react' | 'vue' | 'angular';
type StylingOption = 'tailwind' | 'scss' | 'styled-components';
type StateManagement = 'redux' | 'mobx' | 'zustand';
type BackendFramework = 'express' | 'nest' | 'fastify' | 'koa';
type Database = 'postgresql' | 'mongodb' | 'mysql';
type CachingOption = 'redis' | 'memcached';
type AuthOption = 'jwt' | 'oauth' | 'session';

interface FrontendStack {
  framework: FrontendFramework;
  styling?: StylingOption;
  stateManagement?: StateManagement;
}

interface BackendStack {
  framework: BackendFramework;
  database?: Database;
  caching?: CachingOption;
  authentication?: AuthOption;
}

interface TechStack {
  frontend: FrontendStack;
  backend: BackendStack;
}

type TechOption = {
  value: string;
  label: string;
  description: string;
  icon: string;
};

const FRONTEND_FRAMEWORKS: TechOption[] = [
  {
    value: 'next',
    label: 'Next.js',
    description: 'React framework for production-grade applications',
    icon: '⚡',
  },
  {
    value: 'react',
    label: 'React',
    description: 'A JavaScript library for building user interfaces',
    icon: '⚛️',
  },
  {
    value: 'vue',
    label: 'Vue.js',
    description: 'Progressive JavaScript framework',
    icon: '💚',
  },
  {
    value: 'angular',
    label: 'Angular',
    description: 'Platform for building mobile and desktop applications',
    icon: '🔺',
  },
];

const STYLING_OPTIONS: TechOption[] = [
  {
    value: 'tailwind',
    label: 'Tailwind CSS',
    description: 'Utility-first CSS framework',
    icon: '🎨',
  },
  {
    value: 'scss',
    label: 'SCSS',
    description: 'Professional grade CSS extension',
    icon: '📝',
  },
  {
    value: 'styled-components',
    label: 'Styled Components',
    description: 'CSS-in-JS styling solution',
    icon: '💅',
  },
];

const STATE_MANAGEMENT: TechOption[] = [
  {
    value: 'redux',
    label: 'Redux Toolkit',
    description: 'State management with Redux Toolkit',
    icon: '📦',
  },
  {
    value: 'mobx',
    label: 'MobX',
    description: 'Simple, scalable state management',
    icon: '🔄',
  },
  {
    value: 'zustand',
    label: 'Zustand',
    description: 'Small, fast, and scalable state management',
    icon: '🐻',
  },
];

const BACKEND_FRAMEWORKS: TechOption[] = [
  {
    value: 'express',
    label: 'Express.js',
    description: 'Fast, unopinionated web framework for Node.js',
    icon: '🚂',
  },
  {
    value: 'nest',
    label: 'NestJS',
    description: 'Progressive Node.js framework',
    icon: '🐱',
  },
  {
    value: 'fastify',
    label: 'Fastify',
    description: 'Fast and low overhead web framework',
    icon: '⚡',
  },
  {
    value: 'koa',
    label: 'Koa',
    description: 'Next generation web framework by Express team',
    icon: '🎯',
  },
];

const DATABASES: TechOption[] = [
  {
    value: 'postgresql',
    label: 'PostgreSQL',
    description: 'Advanced open source database',
    icon: '🐘',
  },
  {
    value: 'mongodb',
    label: 'MongoDB',
    description: 'Document-based NoSQL database',
    icon: '🍃',
  },
  {
    value: 'mysql',
    label: 'MySQL',
    description: 'Popular open source database',
    icon: '🐬',
  },
];

const CACHING: TechOption[] = [
  {
    value: 'redis',
    label: 'Redis',
    description: 'In-memory data structure store',
    icon: '⚡',
  },
  {
    value: 'memcached',
    label: 'Memcached',
    description: 'Distributed memory caching system',
    icon: '💾',
  },
];

const AUTHENTICATION: TechOption[] = [
  {
    value: 'jwt',
    label: 'JWT',
    description: 'JSON Web Token based authentication',
    icon: '🔑',
  },
  {
    value: 'oauth',
    label: 'OAuth 2.0',
    description: 'Standard protocol for authorization',
    icon: '🔐',
  },
  {
    value: 'session',
    label: 'Session',
    description: 'Traditional session-based authentication',
    icon: '🍪',
  },
];

export const TechStackStep: React.FC<TechStackStepProps> = ({ config, onUpdateConfig }) => {
  const handleFrontendChange = (key: keyof FrontendStack, value: FrontendFramework | StylingOption | StateManagement) => {
    onUpdateConfig({
      techStack: {
        ...config.techStack,
        frontend: {
          framework: config.techStack?.frontend?.framework || 'next',
          ...config.techStack?.frontend,
          [key]: value,
        },
        backend: {
          framework: config.techStack?.backend?.framework || 'express',
          ...config.techStack?.backend,
        },
        deployment: config.techStack?.deployment || {
          platform: 'vercel',
        },
      },
    });
  };

  const handleBackendChange = (key: keyof BackendStack, value: BackendFramework | Database | CachingOption | AuthOption) => {
    onUpdateConfig({
      techStack: {
        ...config.techStack,
        frontend: {
          framework: config.techStack?.frontend?.framework || 'next',
          ...config.techStack?.frontend,
        },
        backend: {
          framework: config.techStack?.backend?.framework || 'express',
          ...config.techStack?.backend,
          [key]: value,
        },
        deployment: config.techStack?.deployment || {
          platform: 'vercel',
        },
      },
    });
  };

  const renderTechOptions = (
    options: TechOption[],
    selectedValue: string | undefined,
    onChange: (value: any) => void
  ) => (
    <div className="grid grid-cols-2 gap-4">
      {options.map(({ value, label, description, icon }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`p-4 rounded-lg border-2 text-left transition-colors ${
            selectedValue === value
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
          }`}
        >
          <div className="flex items-start space-x-4">
            <div className="text-2xl">{icon}</div>
            <div>
              <h3 className="font-medium text-gray-900">{label}</h3>
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Frontend Stack */}
      {(config.type === 'frontend' || config.type === 'full-stack') && (
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-gray-900">Frontend Stack</h2>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Framework</h3>
            {renderTechOptions(
              FRONTEND_FRAMEWORKS,
              config.techStack?.frontend?.framework,
              value => handleFrontendChange('framework', value as FrontendFramework)
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Styling Solution</h3>
            {renderTechOptions(
              STYLING_OPTIONS,
              config.techStack?.frontend?.styling,
              value => handleFrontendChange('styling', value as StylingOption)
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">State Management</h3>
            {renderTechOptions(
              STATE_MANAGEMENT,
              config.techStack?.frontend?.stateManagement,
              value => handleFrontendChange('stateManagement', value as StateManagement)
            )}
          </div>
        </div>
      )}

      {/* Backend Stack */}
      {(config.type === 'backend' || config.type === 'full-stack') && (
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-gray-900">Backend Stack</h2>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Framework</h3>
            {renderTechOptions(
              BACKEND_FRAMEWORKS,
              config.techStack?.backend?.framework,
              value => handleBackendChange('framework', value as BackendFramework)
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Database</h3>
            {renderTechOptions(
              DATABASES,
              config.techStack?.backend?.database,
              value => handleBackendChange('database', value as Database)
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Caching</h3>
            {renderTechOptions(
              CACHING,
              config.techStack?.backend?.caching,
              value => handleBackendChange('caching', value as CachingOption)
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Authentication</h3>
            {renderTechOptions(
              AUTHENTICATION,
              config.techStack?.backend?.authentication,
              value => handleBackendChange('authentication', value as AuthOption)
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 