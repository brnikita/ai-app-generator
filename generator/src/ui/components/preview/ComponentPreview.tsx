import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ComponentPreviewProps {
  components: Record<string, string>;
  selectedComponent: string | null;
  onSelectComponent: (component: string) => void;
}

export const ComponentPreview: React.FC<ComponentPreviewProps> = ({
  components,
  selectedComponent,
  onSelectComponent,
}) => {
  const componentPaths = Object.keys(components);

  return (
    <div className="flex h-full">
      {/* Component List */}
      <div className="w-64 border-r border-gray-200 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Components</h3>
          <div className="space-y-1">
            {componentPaths.map(path => (
              <button
                key={path}
                className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                  selectedComponent === path
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => onSelectComponent(path)}
              >
                {path}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Component Preview */}
      <div className="flex-1 overflow-hidden">
        {selectedComponent ? (
          <div className="h-full flex flex-col">
            {/* Component Path */}
            <div className="px-4 py-2 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">{selectedComponent}</h3>
            </div>

            {/* Code Preview */}
            <div className="flex-1 overflow-auto p-4">
              <SyntaxHighlighter
                language="typescript"
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  borderRadius: '0.375rem',
                }}
              >
                {components[selectedComponent]}
              </SyntaxHighlighter>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a component to preview
          </div>
        )}
      </div>
    </div>
  );
}; 