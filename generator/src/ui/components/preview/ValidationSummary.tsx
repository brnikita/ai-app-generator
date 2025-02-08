import React from 'react';

interface ValidationSummaryProps {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
  suggestions: string[];
}

export const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  isValid,
  errors,
  warnings,
  suggestions,
}) => {
  const hasErrors = Object.keys(errors).length > 0;
  const hasWarnings = Object.keys(warnings).length > 0;
  const hasSuggestions = suggestions.length > 0;

  return (
    <div className="p-4 border-b border-gray-200">
      {/* Status Badge */}
      <div className="flex items-center mb-4">
        <div
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {isValid ? 'Valid Configuration' : 'Invalid Configuration'}
        </div>
      </div>

      {/* Errors */}
      {hasErrors && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-red-800 mb-2">Errors</h3>
          <div className="bg-red-50 p-3 rounded-md">
            {Object.entries(errors).map(([field, messages]) => (
              <div key={field} className="mb-2 last:mb-0">
                <p className="text-sm font-medium text-red-800">{field}</p>
                <ul className="mt-1 ml-4 list-disc">
                  {messages.map((message, index) => (
                    <li key={index} className="text-sm text-red-700">
                      {message}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {hasWarnings && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Warnings</h3>
          <div className="bg-yellow-50 p-3 rounded-md">
            {Object.entries(warnings).map(([field, messages]) => (
              <div key={field} className="mb-2 last:mb-0">
                <p className="text-sm font-medium text-yellow-800">{field}</p>
                <ul className="mt-1 ml-4 list-disc">
                  {messages.map((message, index) => (
                    <li key={index} className="text-sm text-yellow-700">
                      {message}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {hasSuggestions && (
        <div>
          <h3 className="text-sm font-medium text-blue-800 mb-2">Suggestions</h3>
          <div className="bg-blue-50 p-3 rounded-md">
            <ul className="list-disc ml-4">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-blue-700 mb-1 last:mb-0">
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}; 