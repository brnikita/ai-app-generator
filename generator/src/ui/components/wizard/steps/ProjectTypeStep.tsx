import React from 'react';
import { ProjectConfig } from '../../../../core/models/project';

interface ProjectTypeStepProps {
  config: Partial<ProjectConfig>;
  onUpdateConfig: (updates: Partial<ProjectConfig>) => void;
}

type ProjectType = 'web-app' | 'api' | 'landing-page' | 'dashboard' | 'e-commerce';
type ProjectCategory = 'web' | 'backend';

interface ProjectTypeOption {
  id: ProjectType;
  title: string;
  description: string;
  icon: string;
  category: ProjectCategory;
}

const PROJECT_TYPES: ProjectTypeOption[] = [
  {
    id: 'web-app',
    title: 'Web Application',
    description: 'Create a modern web application with a responsive UI',
    icon: '🌐',
    category: 'web',
  },
  {
    id: 'api',
    title: 'API Service',
    description: 'Build a robust REST or GraphQL API service',
    icon: '⚡',
    category: 'backend',
  },
  {
    id: 'landing-page',
    title: 'Landing Page',
    description: 'Design a high-converting landing page with modern UI/UX',
    icon: '🎯',
    category: 'web',
  },
  {
    id: 'dashboard',
    title: 'Admin Dashboard',
    description: 'Create a powerful admin dashboard with data visualization',
    icon: '📊',
    category: 'web',
  },
  {
    id: 'e-commerce',
    title: 'E-commerce Platform',
    description: 'Build a scalable e-commerce platform with payment integration',
    icon: '🛍️',
    category: 'web',
  },
] as const;

export const ProjectTypeStep: React.FC<ProjectTypeStepProps> = ({ config, onUpdateConfig }) => {
  const handleTypeSelect = (type: ProjectType, category: ProjectCategory) => {
    onUpdateConfig({ type, category });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onUpdateConfig({ [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Choose Project Type</h2>
        <p className="mt-2 text-gray-600">
          Select the type of project you want to create. This will determine the available features and
          tech stack options.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PROJECT_TYPES.map(({ id, title, description, icon, category }) => (
          <button
            key={id}
            onClick={() => handleTypeSelect(id, category)}
            className={`relative rounded-lg border ${
              config.type === id
                ? 'border-blue-500 ring-2 ring-blue-500'
                : 'border-gray-300 hover:border-gray-400'
            } bg-white p-6 shadow-sm focus:outline-none`}
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 text-2xl">{icon}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p
                    className={`text-sm font-medium ${
                      config.type === id ? 'text-blue-600' : 'text-gray-900'
                    }`}
                  >
                    {title}
                  </p>
                </div>
                <p className="mt-1 text-sm text-gray-500">{description}</p>
              </div>
            </div>
            {config.type === id && (
              <div className="absolute top-2 right-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                  <svg
                    className="h-4 w-4 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Project Details */}
      <div className="space-y-6">
        <h2 className="text-lg font-medium text-gray-900">Project Details</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Project Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={config.name || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="my-awesome-project"
            />
          </div>
          <div>
            <label htmlFor="version" className="block text-sm font-medium text-gray-700">
              Version
            </label>
            <input
              type="text"
              id="version"
              name="version"
              value={config.version || '1.0.0'}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="1.0.0"
            />
          </div>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={config.description || ''}
            onChange={handleInputChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Describe your project..."
          />
        </div>
      </div>
    </div>
  );
}; 