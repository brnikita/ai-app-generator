import React from 'react';

interface DependencyListProps {
  dependencies: Record<string, string>;
}

export const DependencyList: React.FC<DependencyListProps> = ({ dependencies }) => {
  const sortedDependencies = Object.entries(dependencies).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="space-y-6">
      {/* Dependencies Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Package
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Version
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedDependencies.map(([name, version]) => (
              <tr key={name} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <code className="px-2 py-1 bg-gray-100 rounded-md">{version}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">Total Dependencies</div>
          <div className="text-sm font-medium text-gray-900">
            {Object.keys(dependencies).length}
          </div>
        </div>
      </div>

      {/* Package.json Preview */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">package.json</h3>
        </div>
        <div className="p-4">
          <pre className="bg-gray-50 rounded-md p-4 text-sm text-gray-700 overflow-auto">
            {JSON.stringify({ dependencies }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}; 