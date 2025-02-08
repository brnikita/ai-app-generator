import React from 'react';
import { ProjectConfig } from '../../../../core/models/project';

interface ProjectTypeStepProps {
  config: Partial<ProjectConfig>;
  onUpdateConfig: (updates: Partial<ProjectConfig>) => void;
}

type ProjectType = {
  type: ProjectConfig['type'];
  category: ProjectConfig['category'];
  title: string;
  description: string;
  icon: string;
};

const PROJECT_TYPES: ProjectType[] = [
  {
    type: 'frontend',
    category: 'web-app',
    title: 'Web Application',
    description: 'A modern web application with interactive UI',
    icon: '🌐',
  },
  {
    type: 'frontend',
    category: 'admin-dashboard',
    title: 'Admin Dashboard',
    description: 'A comprehensive admin interface for managing data',
    icon: '📊',
  },
  {
    type: 'backend',
    category: 'web-app',
    title: 'Backend API',
    description: 'A robust REST or GraphQL API service',
    icon: '⚙️',
  },
  {
    type: 'full-stack',
    category: 'web-app',
    title: 'Full-Stack Application',
    description: 'A complete web application with frontend and backend',
    icon: '🚀',
  },
  {
    type: 'full-stack',
    category: 'e-commerce',
    title: 'E-Commerce Platform',
    description: 'A full-featured online store application',
    icon: '🛍️',
  },
];

export const ProjectTypeStep: React.FC<ProjectTypeStepProps> = ({ config, onUpdateConfig }) => {
  const handleTypeSelect = (type: ProjectConfig['type'], category: ProjectConfig['category']) => {
    onUpdateConfig({ type, category });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onUpdateConfig({ [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-8">
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

      {/* Project Type Selection */}
      <div className="space-y-6">
        <h2 className="text-lg font-medium text-gray-900">Project Type</h2>
        <div className="grid grid-cols-2 gap-4">
          {PROJECT_TYPES.map(({ type, category, title, description, icon }) => (
            <button
              key={`${type}-${category}`}
              onClick={() => handleTypeSelect(type, category)}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                config.type === type && config.category === category
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="text-2xl">{icon}</div>
                <div>
                  <h3 className="font-medium text-gray-900">{title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}; 