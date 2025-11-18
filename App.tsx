
import React, { useState } from 'react';
import type { GeneratedConfig, ServerConfig } from './types';
import { generateServerConfig } from './services/geminiService';
import Header from './components/Header';
import ServerConfigForm from './components/ServerConfigForm';
import CodeOutput from './components/CodeOutput';
import { LoaderCircle, AlertTriangle, FileCode2, Info, Archive, MemoryStick, Shapes, ChevronDown, Cpu, HardDrive } from 'lucide-react';
import JSZip from 'jszip';
import { useLanguage } from './contexts/LanguageContext';

const sendDiscordNotification = async (
    webhookUrl: string,
    serverConfig: ServerConfig,
    generatedConfig: GeneratedConfig
) => {
    const { gameName, serverName, playerCount } = serverConfig;
    const { files, recommendedRamGB, recommendedCpu, recommendedSsdGB } = generatedConfig;

    const fileList = files.map(f => f.fileName).join(', ') || 'N/A';
    
    const recommendations = [
        recommendedRamGB && `RAM: **${recommendedRamGB}GB**`,
        recommendedCpu && `CPU: **${recommendedCpu}**`,
        recommendedSsdGB && `SSD: **${recommendedSsdGB}GB**`
    ].filter(Boolean).join(' | ');

    const payload = {
        username: "AI Server Builder",
        embeds: [
        {
            title: "✅ Server Configuration Generated!",
            description: `Your configuration files for **${gameName}** are ready.`,
            color: 3447003, // A nice blue color
            fields: [
                { name: "Server Name", value: serverName, inline: true },
                { name: "Max Players", value: String(playerCount), inline: true },
                { name: "Game", value: gameName, inline: true },
                { name: "📄 Generated Files", value: `\`${fileList}\`` },
                ...(recommendations ? [{ name: "💡 System Recommendations", value: recommendations }] : [])
            ],
            footer: {
                text: "Powered by Google Gemini"
            },
            timestamp: new Date().toISOString()
        }
        ]
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error(`Discord webhook failed with status ${response.status}:`, await response.text());
        }
    } catch (error) {
        console.error("Failed to send Discord notification:", error);
    }
};


const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedConfig, setGeneratedConfig] = useState<GeneratedConfig | null>(null);
  const [submittedConfig, setSubmittedConfig] = useState<ServerConfig | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, boolean>>({});
  const [isExplanationOpen, setIsExplanationOpen] = useState(true);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const { language, t } = useLanguage();

  const handleGenerate = async (config: ServerConfig) => {
    setIsLoading(true);
    setError(null);
    setGeneratedConfig(null);
    setSubmittedConfig(config);
    setSelectedFiles({});
    setIsExplanationOpen(true);
    setActiveFile(null);

    try {
      const result = await generateServerConfig(config, language);
      setGeneratedConfig(result);
      const initialSelection = result.files.reduce((acc, file) => {
        acc[file.fileName] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setSelectedFiles(initialSelection);
      if (result.files.length > 0) {
        setActiveFile(result.files[0].fileName);
      }

      // Send Discord notification if URL is provided
      if (config.discordWebhookUrl) {
          sendDiscordNotification(config.discordWebhookUrl, config, result);
      }

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
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-4 animate-fade-in-left">
            <ServerConfigForm onGenerate={handleGenerate} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-8 animate-fade-in-right">
            <div className="glass-container rounded-2xl p-6 shadow-2xl shadow-black/20 h-full min-h-[400px] lg:min-h-0 flex flex-col">
              <h2 className="text-xl font-bold mb-4 text-cyan-400 flex items-center">
                <FileCode2 className="w-6 h-6 mr-3" />
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
                 <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-500 p-8">
                    <Shapes className="w-16 h-16 mb-6 text-slate-700" />
                    <h3 className="text-xl font-bold text-slate-300 mb-2">{t('results.initialPlaceholderTitle')}</h3>
                    <p className="max-w-md text-slate-400">{t('results.initialPlaceholderSubtitle')}</p>
                 </div>
              )}
              {generatedConfig && (
                <div className="space-y-6">
                    <div className="space-y-4">
                      {generatedConfig.explanation && (
                        <div className="bg-sky-500/10 border border-sky-500/20 rounded-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                          <button
                            onClick={() => setIsExplanationOpen(prev => !prev)}
                            className="w-full flex items-center justify-between p-4 text-left focus:outline-none focus:ring-2 focus:ring-sky-500/50 rounded-lg"
                            aria-expanded={isExplanationOpen}
                            aria-controls="explanation-panel"
                          >
                            <h3 className="font-bold text-sky-300 flex items-center text-md">
                              <Info className="w-5 h-5 mr-2" />
                              {t('results.explanationTitle')}
                            </h3>
                            <ChevronDown className={`w-5 h-5 text-sky-400 transition-transform duration-300 ${isExplanationOpen ? 'rotate-180' : ''}`} />
                          </button>
                           <div
                              id="explanation-panel"
                              className={`transition-all duration-500 ease-in-out overflow-y-auto no-scrollbar ${isExplanationOpen ? 'max-h-96' : 'max-h-0'}`}
                            >
                              <div className="px-4 pb-4">
                                <p className="text-sm text-sky-200 whitespace-pre-wrap border-t border-sky-500/20 pt-3 mt-1">{generatedConfig.explanation}</p>
                              </div>
                            </div>
                        </div>
                      )}

                        {(generatedConfig.recommendedRamGB || generatedConfig.recommendedCpu || generatedConfig.recommendedSsdGB) && (
                            <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                                <h3 className="font-bold text-slate-300 mb-3 mt-2">{t('results.recommendationsTitle')}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {generatedConfig.recommendedRamGB && (
                                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                                            <h4 className="font-bold text-purple-300 flex items-center mb-2 text-sm">
                                                <MemoryStick className="w-4 h-4 mr-2"/>
                                                {t('results.ramTitle')}
                                            </h4>
                                            <p className="text-2xl font-bold text-slate-200">
                                                {generatedConfig.recommendedRamGB} <span className="text-base font-medium text-purple-200">{t('results.ramUnit')}</span>
                                            </p>
                                        </div>
                                    )}
                                    {generatedConfig.recommendedCpu && (
                                        <div className="bg-sky-500/10 border border-sky-500/20 rounded-lg p-4">
                                            <h4 className="font-bold text-sky-300 flex items-center mb-2 text-sm">
                                                <Cpu className="w-4 h-4 mr-2"/>
                                                {t('results.cpuTitle')}
                                            </h4>
                                            <p className="text-base font-semibold text-slate-200 leading-tight">
                                                {generatedConfig.recommendedCpu}
                                            </p>
                                        </div>
                                    )}
                                    {generatedConfig.recommendedSsdGB && (
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                                            <h4 className="font-bold text-emerald-300 flex items-center mb-2 text-sm">
                                                <HardDrive className="w-4 h-4 mr-2"/>
                                                {t('results.ssdTitle')}
                                            </h4>
                                            <p className="text-2xl font-bold text-slate-200">
                                                {generatedConfig.recommendedSsdGB} <span className="text-base font-medium text-emerald-200">{t('results.ssdUnit')}</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                  {generatedConfig.files.length > 0 && (
                    <div className="pt-4 space-y-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-2">
                            <h4 className="font-bold text-slate-300">{t('results.selectFilesTitle')}</h4>
                            <button
                                onClick={handleDownloadZip}
                                disabled={isZipping || selectedCount === 0}
                                className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-lg shadow-indigo-500/20 text-sm shrink-0"
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
                        
                        <div className="border-b border-slate-700 flex space-x-2 overflow-x-auto no-scrollbar">
                            {generatedConfig.files.map(file => (
                                <div key={file.fileName} 
                                     className={`flex items-center shrink-0 pl-3 pr-4 py-2 border-b-2 text-sm font-medium rounded-t-md transition-colors cursor-pointer ${
                                        activeFile === file.fileName
                                        ? 'border-cyan-400 text-cyan-400 bg-slate-800/50'
                                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                                     }`}
                                     onClick={() => setActiveFile(file.fileName)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedFiles[file.fileName] || false}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            handleFileSelectionChange(file.fileName);
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="h-4 w-4 mr-2 accent-cyan-500 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500"
                                        aria-label={`Select file ${file.fileName}`}
                                    />
                                    <span className="font-mono select-none">{file.fileName}</span>
                                </div>
                            ))}
                        </div>

                         <div className="mt-0">
                            {activeFile && (() => {
                                const file = generatedConfig.files.find(f => f.fileName === activeFile);
                                if (!file) return null;
                                return <CodeOutput key={file.fileName} title={file.fileName} code={file.fileContent} />;
                            })()}
                        </div>
                    </div>
                  )}
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
