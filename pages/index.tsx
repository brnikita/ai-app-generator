import { NextPage } from 'next';
import { useState } from 'react';
import { ProjectConfig } from '../generator/src/core/models/project';
import { PreviewService } from '../generator/src/core/services/preview-service';

const Home: NextPage = () => {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedConfig, setGeneratedConfig] = useState<ProjectConfig | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    try {
      const previewService = new PreviewService(process.env.NEXT_PUBLIC_AI_API_KEY || '');
      const config = await previewService.generateFromDescription(description);
      setGeneratedConfig(config);
    } catch (error) {
      console.error('Error generating project:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate project');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            AI-CRM Generator
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            Describe Your CRM
          </h2>
          <p className="text-lg text-gray-300 text-center mb-8">
            Tell us what you need, and our AI will generate a custom CRM solution
          </p>

          {/* Input Section */}
          <div className="space-y-4">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Example: I need a CRM for a real estate agency with lead management, property listings, and automated follow-ups..."
              className="w-full h-48 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-white placeholder-gray-400"
              disabled={isGenerating}
            />
            {error && (
              <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
                {error}
              </div>
            )}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !description.trim()}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                isGenerating || !description.trim()
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
              }`}
            >
              {isGenerating ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin" />
                  <span>Generating...</span>
                </div>
              ) : (
                'Generate CRM'
              )}
            </button>
          </div>

          {/* Generated Config */}
          {generatedConfig && !isGenerating && (
            <div className="mt-8 p-6 bg-gray-800 border border-gray-700 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Generated Configuration</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-gray-400">Project Type:</span>
                  <span className="ml-2 text-blue-400">{generatedConfig.type}</span>
                </div>
                <div>
                  <span className="text-gray-400">Name:</span>
                  <span className="ml-2">{generatedConfig.name}</span>
                </div>
                <div>
                  <span className="text-gray-400">Description:</span>
                  <p className="mt-1 text-sm">{generatedConfig.description}</p>
                </div>
                <div>
                  <span className="text-gray-400">Features:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {generatedConfig.features.map((feature) => (
                      <span
                        key={feature}
                        className="px-2 py-1 text-sm bg-gray-700 rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Tech Stack:</span>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <span className="text-purple-400 w-24">Frontend:</span>
                      <span>{generatedConfig.techStack.frontend.framework}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-purple-400 w-24">Backend:</span>
                      <span>{generatedConfig.techStack.backend.framework}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-purple-400 w-24">Database:</span>
                      <span>{generatedConfig.techStack.backend.database}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    // TODO: Handle project generation
                    console.log('Generating project with config:', generatedConfig);
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
                >
                  Create Project
                </button>
              </div>
            </div>
          )}

          {/* Features Section */}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="text-lg font-medium text-blue-400">AI-Powered</div>
              <div className="mt-2 text-gray-300">
                Advanced AI understands your needs and generates tailored solutions
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="text-lg font-medium text-purple-400">Modern Stack</div>
              <div className="mt-2 text-gray-300">
                Built with Next.js, TypeScript, and enterprise-grade technologies
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="text-lg font-medium text-pink-400">Production-Ready</div>
              <div className="mt-2 text-gray-300">
                Includes testing, documentation, and deployment configurations
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-400 text-sm">
            © 2024 AI-CRM Generator. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home; 