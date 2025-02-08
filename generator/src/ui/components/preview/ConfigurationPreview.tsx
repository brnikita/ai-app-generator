import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ConfigurationPreviewProps {
  configuration: Record<string, any>;
}

export const ConfigurationPreview: React.FC<ConfigurationPreviewProps> = ({ configuration }) => {
  const sections = [
    { title: 'Project', keys: ['name', 'version', 'type'] },
    { title: 'Features', keys: ['features'] },
    { title: 'Frontend', keys: ['techStack.frontend'] },
    { title: 'Backend', keys: ['techStack.backend'] },
    { title: 'Deployment', keys: ['techStack.deployment'] },
  ];

  const getValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Sections */}
      {sections.map(section => {
        const sectionData = section.keys.reduce((acc, key) => {
          acc[key] = getValue(configuration, key);
          return acc;
        }, {} as Record<string, any>);

        return (
          <div key={section.title} className="bg-white rounded-lg shadow">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">{section.title}</h3>
            </div>
            <div className="p-4">
              <SyntaxHighlighter
                language="json"
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  borderRadius: '0.375rem',
                }}
              >
                {JSON.stringify(sectionData, null, 2)}
              </SyntaxHighlighter>
            </div>
          </div>
        );
      })}

      {/* Raw Configuration */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">Raw Configuration</h3>
        </div>
        <div className="p-4">
          <SyntaxHighlighter
            language="json"
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              borderRadius: '0.375rem',
            }}
          >
            {JSON.stringify(configuration, null, 2)}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}; 