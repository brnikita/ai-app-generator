import React from 'react';
import { ProjectConfig } from '../../../../core/models/project';

interface ConfigurationStepProps {
  config: Partial<ProjectConfig>;
  onUpdateConfig: (updates: Partial<ProjectConfig>) => void;
}

type ConfigSection = {
  id: string;
  title: string;
  description: string;
  icon: string;
  fields: ConfigField[];
  showIf?: (config: Partial<ProjectConfig>) => boolean;
};

type ConfigField = {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'toggle' | 'color';
  description?: string;
  defaultValue?: any;
  options?: { value: string; label: string }[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  showIf?: (config: Partial<ProjectConfig>) => boolean;
};

const CONFIG_SECTIONS: ConfigSection[] = [
  // Frontend Configuration
  {
    id: 'frontend',
    title: 'Frontend Configuration',
    description: 'Configure frontend-specific settings',
    icon: '🎨',
    showIf: (config: Partial<ProjectConfig>): boolean => {
      const type = config.type || '';
      return ['frontend', 'full-stack'].includes(type);
    },
    fields: [
      {
        id: 'port',
        label: 'Development Port',
        type: 'number',
        description: 'Port number for development server',
        defaultValue: 3000,
        validation: {
          required: true,
          min: 1024,
          max: 65535,
        },
      },
      {
        id: 'baseUrl',
        label: 'Base URL',
        type: 'text',
        description: 'Base URL for the application',
        defaultValue: '/',
        validation: {
          required: true,
          pattern: '^/',
        },
      },
      {
        id: 'theme',
        label: 'Default Theme',
        type: 'select',
        options: [
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
          { value: 'system', label: 'System' },
        ],
        defaultValue: 'system',
        showIf: config => config.features?.includes('dark-mode'),
      },
      {
        id: 'primaryColor',
        label: 'Primary Color',
        type: 'color',
        defaultValue: '#3B82F6',
      },
    ],
  },

  // Backend Configuration
  {
    id: 'backend',
    title: 'Backend Configuration',
    description: 'Configure backend-specific settings',
    icon: '⚙️',
    showIf: (config: Partial<ProjectConfig>): boolean => {
      const type = config.type || '';
      return ['backend', 'full-stack'].includes(type);
    },
    fields: [
      {
        id: 'port',
        label: 'Server Port',
        type: 'number',
        description: 'Port number for API server',
        defaultValue: 4000,
        validation: {
          required: true,
          min: 1024,
          max: 65535,
        },
      },
      {
        id: 'corsOrigins',
        label: 'CORS Origins',
        type: 'text',
        description: 'Allowed CORS origins (comma-separated)',
        defaultValue: '*',
        validation: {
          required: true,
        },
      },
      {
        id: 'rateLimit',
        label: 'Rate Limit',
        type: 'number',
        description: 'Maximum requests per minute',
        defaultValue: 100,
        validation: {
          required: true,
          min: 1,
        },
      },
    ],
  },

  // Database Configuration
  {
    id: 'database',
    title: 'Database Configuration',
    description: 'Configure database connection settings',
    icon: '💾',
    showIf: (config: Partial<ProjectConfig>): boolean => {
      const features = config.features || [];
      return features.includes('database');
    },
    fields: [
      {
        id: 'host',
        label: 'Database Host',
        type: 'text',
        description: 'Database server hostname',
        defaultValue: 'localhost',
        validation: {
          required: true,
        },
      },
      {
        id: 'port',
        label: 'Database Port',
        type: 'number',
        description: 'Database server port',
        defaultValue: 5432,
        validation: {
          required: true,
          min: 1,
          max: 65535,
        },
      },
      {
        id: 'name',
        label: 'Database Name',
        type: 'text',
        description: 'Name of the database',
        validation: {
          required: true,
        },
      },
    ],
  },

  // Authentication Configuration
  {
    id: 'auth',
    title: 'Authentication Configuration',
    description: 'Configure authentication settings',
    icon: '🔐',
    showIf: (config: Partial<ProjectConfig>): boolean => {
      const features = config.features || [];
      return features.includes('authentication');
    },
    fields: [
      {
        id: 'jwtSecret',
        label: 'JWT Secret',
        type: 'text',
        description: 'Secret key for JWT signing',
        validation: {
          required: true,
          pattern: '.{32,}',
        },
      },
      {
        id: 'tokenExpiry',
        label: 'Token Expiry',
        type: 'text',
        description: 'JWT token expiry (e.g., 24h, 7d)',
        defaultValue: '24h',
        validation: {
          required: true,
          pattern: '^\\d+[hdwm]$',
        },
      },
      {
        id: 'sessionDuration',
        label: 'Session Duration',
        type: 'text',
        description: 'Session duration (e.g., 30d)',
        defaultValue: '30d',
        validation: {
          required: true,
          pattern: '^\\d+[hdwm]$',
        },
      },
    ],
  },

  // Deployment Configuration
  {
    id: 'deployment',
    title: 'Deployment Configuration',
    description: 'Configure deployment settings',
    icon: '🚀',
    fields: [
      {
        id: 'environment',
        label: 'Environment',
        type: 'select',
        options: [
          { value: 'development', label: 'Development' },
          { value: 'staging', label: 'Staging' },
          { value: 'production', label: 'Production' },
        ],
        defaultValue: 'development',
      },
      {
        id: 'region',
        label: 'Deployment Region',
        type: 'select',
        options: [
          { value: 'us-east-1', label: 'US East (N. Virginia)' },
          { value: 'us-west-2', label: 'US West (Oregon)' },
          { value: 'eu-west-1', label: 'EU (Ireland)' },
          { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
        ],
        defaultValue: 'us-east-1',
        showIf: config => config.techStack?.deployment?.platform === 'aws',
      },
    ],
  },
];

export const ConfigurationStep: React.FC<ConfigurationStepProps> = ({ config, onUpdateConfig }) => {
  const handleFieldChange = (sectionId: string, fieldId: string, value: any) => {
    onUpdateConfig({
      configuration: {
        ...config.configuration,
        [sectionId]: {
          ...config.configuration?.[sectionId],
          [fieldId]: value,
        },
      },
    });
  };

  const renderField = (section: ConfigSection, field: ConfigField) => {
    if (field.showIf && !field.showIf(config)) return null;

    const value = config.configuration?.[section.id]?.[field.id] ?? field.defaultValue;

    const commonProps = {
      id: `${section.id}-${field.id}`,
      name: `${section.id}-${field.id}`,
      value: value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        handleFieldChange(section.id, field.id, e.target.value),
      className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500',
    };

    switch (field.type) {
      case 'select':
        return (
          <select {...commonProps}>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            min={field.validation?.min}
            max={field.validation?.max}
            {...commonProps}
          />
        );

      case 'color':
        return (
          <input
            type="color"
            {...commonProps}
            className="h-10 p-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        );

      case 'toggle':
        return (
          <input
            type="checkbox"
            checked={value}
            onChange={e => handleFieldChange(section.id, field.id, e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        );

      default:
        return (
          <input
            type="text"
            pattern={field.validation?.pattern}
            required={field.validation?.required}
            {...commonProps}
          />
        );
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Advanced Configuration</h2>
        <p className="mt-1 text-sm text-gray-500">
          Configure advanced settings for your project. These settings can be modified later through
          configuration files.
        </p>
      </div>

      {CONFIG_SECTIONS.map(section => {
        if (section.showIf && !section.showIf(config)) return null;

        return (
          <div key={section.id} className="bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-xl">{section.icon}</span>
                <h3 className="text-lg font-medium text-gray-900">{section.title}</h3>
              </div>
              <p className="text-sm text-gray-500 mb-6">{section.description}</p>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {section.fields.map(field => {
                  if (field.showIf && !field.showIf(config)) return null;

                  return (
                    <div key={field.id}>
                      <label
                        htmlFor={`${section.id}-${field.id}`}
                        className="block text-sm font-medium text-gray-700"
                      >
                        {field.label}
                      </label>
                      {field.description && (
                        <p className="mt-1 text-sm text-gray-500">{field.description}</p>
                      )}
                      <div className="mt-1">{renderField(section, field)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}; 