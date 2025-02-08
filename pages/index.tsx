import { NextPage } from 'next';
import { useState } from 'react';
import { ProjectConfig } from '../generator/src/core/models/project';
import { PreviewService } from '../generator/src/core/services/preview-service';
import { ProjectWizard } from '../generator/src/ui/components/wizard/ProjectWizard';

const Home: NextPage = () => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const handleStartProject = () => {
    setIsWizardOpen(true);
  };

  const handleWizardComplete = (config: ProjectConfig) => {
    console.log('Project configuration:', config);
    // TODO: Handle project generation
  };

  const handleWizardCancel = () => {
    setIsWizardOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">AI-CRM Generator</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {!isWizardOpen ? (
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Create Your Custom CRM Solution
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Generate a modern, AI-powered CRM application tailored to your needs
            </p>
            <div className="mt-8">
              <button
                onClick={handleStartProject}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Start New Project
              </button>
            </div>

            {/* Feature Grid */}
            <div className="mt-16">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {/* Feature 1 */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <div className="text-lg font-medium text-gray-900">AI-Powered Generation</div>
                    <div className="mt-2 text-base text-gray-500">
                      Intelligent project structure and code generation using advanced AI models
                    </div>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <div className="text-lg font-medium text-gray-900">Modern Tech Stack</div>
                    <div className="mt-2 text-base text-gray-500">
                      Built with Next.js, TypeScript, and other modern technologies
                    </div>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <div className="text-lg font-medium text-gray-900">Customizable Templates</div>
                    <div className="mt-2 text-base text-gray-500">
                      Choose from various templates and customize them to your needs
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <ProjectWizard
            previewService={new PreviewService(process.env.NEXT_PUBLIC_AI_API_KEY || '')}
            onComplete={handleWizardComplete}
            onCancel={handleWizardCancel}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © 2024 AI-CRM Generator. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home; 