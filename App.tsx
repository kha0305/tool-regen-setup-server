import React, { useState } from 'react';
import type { GeneratedConfig, ServerConfig } from './types';
import { generateServerConfig } from './services/geminiService';
import Header from './components/Header';
import ServerConfigForm from './components/ServerConfigForm';
import CodeOutput from './components/CodeOutput';
import { LoaderCircle, AlertTriangle, WandSparkles, Info, Archive } from 'lucide-react';
import JSZip from 'jszip';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedConfig, setGeneratedConfig] = useState<GeneratedConfig | null>(null);
  const [submittedConfig, setSubmittedConfig] = useState<ServerConfig | null>(null);

  const handleGenerate = async (config: ServerConfig) => {
    setIsLoading(true);
    setError(null);
    setGeneratedConfig(null);
    setSubmittedConfig(config);

    try {
      const result = await generateServerConfig(config);
      setGeneratedConfig(result);
    } catch (err) {
      setError(err instanceof Error ? `Failed to generate configuration: ${err.message}` : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadZip = async () => {
    if (!generatedConfig || !submittedConfig) return;

    setIsZipping(true);
    try {
        const zip = new JSZip();
        generatedConfig.files.forEach(file => {
            zip.file(file.fileName, file.fileContent);
        });

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        
        const gameNameSlug = submittedConfig.gameName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const zipFileName = `${gameNameSlug}-server-files.zip`;
        
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = zipFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

    } catch (err) {
        setError(err instanceof Error ? `Failed to create ZIP file: ${err.message}` : 'An unknown error occurred while creating ZIP file.');
        console.error(err);
    } finally {
        setIsZipping(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-900 font-sans text-gray-200">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <ServerConfigForm onGenerate={handleGenerate} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-3">
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 h-full min-h-[400px] lg:min-h-0 flex flex-col">
              <h2 className="text-xl font-bold mb-4 text-cyan-400 flex items-center">
                <WandSparkles className="w-6 h-6 mr-2" />
                Generated Output
              </h2>
              {isLoading && (
                <div className="flex-grow flex flex-col items-center justify-center text-gray-400">
                  <LoaderCircle className="w-12 h-12 animate-spin text-cyan-500 mb-4" />
                  <p className="text-lg font-semibold">Generating your server files...</p>
                  <p className="text-sm">The AI is crafting your configuration. Please wait.</p>
                </div>
              )}
              {error && (
                <div className="flex-grow flex flex-col items-center justify-center text-red-400 bg-red-900/20 p-4 rounded-lg">
                   <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                   <p className="text-lg font-semibold text-center">An Error Occurred</p>
                   <p className="text-sm text-center">{error}</p>
                </div>
              )}
              {!isLoading && !error && !generatedConfig && (
                 <div className="flex-grow flex flex-col items-center justify-center text-gray-500">
                    <p>Your generated server files and instructions will appear here.</p>
                 </div>
              )}
              {generatedConfig && (
                <div className="space-y-6">
                  {generatedConfig.explanation && (
                    <div className="bg-sky-900/50 border border-sky-700 rounded-lg p-4">
                       <h3 className="font-bold text-sky-300 flex items-center mb-2 text-md">
                         <Info className="w-5 h-5 mr-2" />
                         Instructions
                       </h3>
                       <p className="text-sm text-sky-200 whitespace-pre-wrap">{generatedConfig.explanation}</p>
                    </div>
                  )}

                  {generatedConfig.files.length > 0 && (
                    <div className="pt-2">
                        <button
                            onClick={handleDownloadZip}
                            disabled={isZipping}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105"
                        >
                            {isZipping ? (
                                <>
                                    <LoaderCircle className="animate-spin w-5 h-5 mr-2" />
                                    Creating ZIP...
                                </>
                            ) : (
                                <>
                                    <Archive className="w-5 h-5 mr-2" />
                                    Download All as .ZIP
                                </>
                            )}
                        </button>
                    </div>
                  )}

                  {generatedConfig.files.map((file, index) => (
                    <CodeOutput key={index} title={file.fileName} code={file.fileContent} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <footer className="text-center py-6 text-sm text-slate-500">
        <p>Powered by Google Gemini API. Built with React & Tailwind CSS.</p>
      </footer>
    </div>
  );
};

export default App;