import React, { useState } from 'react';
import type { GeneratedConfig, ServerConfig } from './types';
import { generateServerConfig } from './services/geminiService';
import Header from './components/Header';
import ServerConfigForm from './components/ServerConfigForm';
import CodeOutput from './components/CodeOutput';
import { LoaderCircle, AlertTriangle, WandSparkles, Info, Archive, MemoryStick } from 'lucide-react';
import JSZip from 'jszip';
import { useLanguage } from './contexts/LanguageContext';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedConfig, setGeneratedConfig] = useState<GeneratedConfig | null>(null);
  const [submittedConfig, setSubmittedConfig] = useState<ServerConfig | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, boolean>>({});
  const { language, t } = useLanguage();

  const handleGenerate = async (config: ServerConfig) => {
    setIsLoading(true);
    setError(null);
    setGeneratedConfig(null);
    setSubmittedConfig(config);
    setSelectedFiles({});

    try {
      const result = await generateServerConfig(config, language);
      setGeneratedConfig(result);
      const initialSelection = result.files.reduce((acc, file) => {
        acc[file.fileName] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setSelectedFiles(initialSelection);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('errors.unknown');
      setError(t('errors.generateConfig', { message }));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelectionChange = (fileName: string) => {
    setSelectedFiles(prev => ({
      ...prev,
      [fileName]: !prev[fileName],
    }));
  };
  
  const handleDownloadZip = async () => {
    if (!generatedConfig || !submittedConfig) return;

    setIsZipping(true);
    try {
        const zip = new JSZip();
        generatedConfig.files.forEach(file => {
            if (selectedFiles[file.fileName]) {
              zip.file(file.fileName, file.fileContent);
            }
        });

        if (Object.keys(zip.files).length === 0) {
            alert(t('results.zipAlert'));
            setIsZipping(false);
            return;
        }

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
        const message = err instanceof Error ? err.message : t('errors.unknown');
        setError(t('errors.zipCreate', { message }));
        console.error(err);
    } finally {
        setIsZipping(false);
    }
  };

  const selectedCount = Object.values(selectedFiles).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300">
      <Header />
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="lg:col-span-2">
            <ServerConfigForm onGenerate={handleGenerate} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-3">
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-2xl shadow-black/20 h-full min-h-[400px] lg:min-h-0 flex flex-col">
              <h2 className="text-xl font-bold mb-4 text-cyan-400 flex items-center">
                <WandSparkles className="w-6 h-6 mr-3" />
                {t('results.title')}
              </h2>
              {isLoading && (
                <div className="flex-grow flex flex-col items-center justify-center text-slate-400">
                  <LoaderCircle className="w-12 h-12 animate-spin text-cyan-500 mb-4" />
                  <p className="text-lg font-semibold animate-pulse-subtle">{t('results.loadingTitle')}</p>
                  <p className="text-sm animate-pulse-subtle">{t('results.loadingSubtitle')}</p>
                </div>
              )}
              {error && (
                <div className="flex-grow flex flex-col items-center justify-center text-red-400 bg-red-900/20 p-4 rounded-lg animate-fade-in-up">
                   <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                   <p className="text-lg font-semibold text-center">{t('results.errorTitle')}</p>
                   <p className="text-sm text-center">{error}</p>
                </div>
              )}
              {!isLoading && !error && !generatedConfig && (
                 <div className="flex-grow flex flex-col items-center justify-center text-slate-500">
                    <p>{t('results.placeholder')}</p>
                 </div>
              )}
              {generatedConfig && (
                <div className="space-y-6 animate-fade-in-up">
                    <div className="space-y-4">
                      {generatedConfig.explanation && (
                        <div className="bg-sky-500/10 border border-sky-500/20 rounded-lg p-4">
                           <h3 className="font-bold text-sky-300 flex items-center mb-2 text-md">
                             <Info className="w-5 h-5 mr-2" />
                             {t('results.explanationTitle')}
                           </h3>
                           <p className="text-sm text-sky-200 whitespace-pre-wrap">{generatedConfig.explanation}</p>
                        </div>
                      )}
                      {generatedConfig.recommendedRamGB && (
                          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                              <h3 className="font-bold text-purple-300 flex items-center mb-2 text-md">
                                  <MemoryStick className="w-5 h-5 mr-2"/>
                                  {t('results.ramTitle')}
                              </h3>
                              <p className="text-3xl font-bold text-slate-200">
                                  {generatedConfig.recommendedRamGB} <span className="text-lg font-medium text-purple-200">{t('results.ramUnit')}</span>
                              </p>
                          </div>
                      )}
                    </div>

                  {generatedConfig.files.length > 0 && (
                    <div className="pt-4 space-y-4">
                        <div className="space-y-2">
                            <h4 className="font-bold text-slate-300">{t('results.selectFilesTitle')}</h4>
                            {generatedConfig.files.map(file => (
                                <label key={file.fileName} className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-slate-800/50 transition-colors">
                                    <input 
                                        type="checkbox"
                                        checked={selectedFiles[file.fileName] || false}
                                        onChange={() => handleFileSelectionChange(file.fileName)}
                                        className="h-4 w-4 accent-cyan-500 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500"
                                        aria-label={`Select file ${file.fileName}`}
                                    />
                                    <span className="font-mono text-sm text-slate-300">{file.fileName}</span>
                                </label>
                            ))}
                        </div>
                        <button
                            onClick={handleDownloadZip}
                            disabled={isZipping || selectedCount === 0}
                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-lg shadow-indigo-500/20"
                        >
                            {isZipping ? (
                                <>
                                    <LoaderCircle className="animate-spin w-5 h-5 mr-2" />
                                    {t('results.downloadZipButtonLoading')}
                                </>
                            ) : (
                                <>
                                    <Archive className="w-5 h-5 mr-2" />
                                    {selectedCount > 0 ? t('results.downloadZipButton', { count: selectedCount }) : t('results.downloadZipButtonNoSelection')}
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
      <footer className="text-center py-8 text-sm text-slate-600">
        <p>{t('footer.text')}</p>
      </footer>
    </div>
  );
};

export default App;