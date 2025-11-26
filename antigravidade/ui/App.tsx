import React, { useState, useRef, useEffect } from 'react';
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider, useMsal, useIsAuthenticated } from "@azure/msal-react";
import { msalConfig, loginRequest } from './authConfig';
import Layout from './components/Layout';
import Button from './components/Button';
import ManualEditor from './components/ManualEditor';
import { User, AidoDocument, DocumentType, ViewState, AppSettings, ProcessingMode, PipelineStage, ManualDraft, SystemStatus } from './types';
import { MOCK_USER, THEME } from './constants';
import { CONFIG } from './config';
import { uploadDocument, getSystemStatus, getSystemConfig, runPipelineSSE, PipelineRunPayload, fetchManual, saveManualContent } from './services/geminiService';

// Initialize MSAL outside component
const msalInstance = new PublicClientApplication(msalConfig);

// --- Components ---

// Expandable Artifact Node for the "Rack"
const ArtifactNode = ({
  label,
  subLabel,
  status,
  type,
  content,
  actionIcon,
  onAction
}: {
  label: string,
  subLabel: string,
  status: 'active' | 'inactive' | 'pending',
  type: string,
  content?: string,
  actionIcon?: React.ReactNode,
  onAction?: () => void
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`flex flex-col rounded-sm border transition-all duration-200 bg-white ${status === 'active' ? 'border-[#005691] shadow-md' : 'border-gray-200 opacity-70'}`}>
      {/* Header Row */}
      <div className="flex items-center gap-3 p-3">
        <div className="relative flex-shrink-0">
          <div className={`w-8 h-8 rounded-sm flex items-center justify-center font-sans text-[10px] font-bold border ${status === 'active' ? 'bg-[#005691] text-white border-[#005691]' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
            {type}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className={`text-xs font-bold truncate leading-none mb-1 ${status === 'active' ? 'text-[#1C1C1C]' : 'text-gray-400'}`}>{label}</h4>
          <p className="text-[9px] font-sans text-gray-500 truncate">{subLabel}</p>
        </div>

        <div className="flex items-center gap-1">
          {/* Expand Toggle (If content exists) */}
          {content && status === 'active' && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`w-6 h-6 flex items-center justify-center rounded-sm transition-colors ${isExpanded ? 'bg-gray-100 text-[#005691]' : 'text-gray-400 hover:bg-gray-50'}`}
              title="Ver Conteúdo"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isExpanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} /></svg>
            </button>
          )}
          {/* Action Button (Download) */}
          {actionIcon && status === 'active' && (
            <button onClick={onAction} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-[#005691] hover:bg-blue-50 rounded-sm transition-colors">
              {actionIcon}
            </button>
          )}
        </div>
      </div>

      {/* Expandable Content Area */}
      {isExpanded && content && (
        <div className="border-t border-gray-100 bg-gray-50 p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[9px] font-bold text-gray-400 uppercase">Prévia do Conteúdo</span>
            <span className="text-[9px] font-mono text-gray-400">{content.length} chars</span>
          </div>
          <pre className="text-[10px] font-mono text-gray-600 whitespace-pre-wrap h-32 overflow-y-auto custom-scrollbar bg-white p-2 rounded-sm border border-gray-200 select-text">
            {content}
          </pre>
        </div>
      )}
    </div>
  );
};

// Pipeline Monitor Component (Full-screen overlay without terminal UI)
const PipelineMonitor = ({ stage, progress, logs }: { stage: PipelineStage; progress: number; logs: string[] }) => {
  const steps = [
    {
      id: PipelineStage.TRANSCRIPTION,
      label: '1. Escuta e Transcrição',
      desc: 'A IA está ouvindo o vídeo e convertendo toda a fala em texto preciso.'
    },
    {
      id: PipelineStage.STRUCTURING,
      label: '2. Organização Lógica',
      desc: 'O conteúdo está sendo analisado e estruturado em capítulos e seções claras.'
    },
    {
      id: PipelineStage.MASTERING,
      label: '3. Refinamento Técnico',
      desc: 'Aplicando a linguagem técnica padrão e as diretrizes de comunicação da Bosch.'
    },
    {
      id: PipelineStage.JSON_CONVERTER,
      label: '4. Formatação Digital',
      desc: 'Preparando o documento para ser compatível com os sistemas de documentação.'
    },
    {
      id: PipelineStage.WRITER,
      label: '5. Geração do Documento',
      desc: 'Escrevendo o arquivo final (Word/PDF) pronto para uso e distribuição.'
    }
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === stage);
  const activeIndex = stage === PipelineStage.COMPLETED ? steps.length : currentStepIndex;
  const safeIndex = Math.min(Math.max(activeIndex, 0), steps.length - 1);
  const activeStep = steps[safeIndex];

  return (
    <div className="flex-1 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-[#F4F7F9] to-[#E8F1F9]" />
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />

      <div className="relative z-10 h-full flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl bg-white/95 border border-gray-200 rounded-sm shadow-xl p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <div className="flex flex-col items-center gap-6 lg:w-1/3">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full text-gray-200" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" stroke="currentColor" strokeWidth="8" fill="none" />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    stroke="#005691"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - progress / 100)}
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-semibold text-[#005691]">{Math.round(progress)}</span>
                  <span className="text-xs font-bold tracking-[0.3em] text-gray-500 uppercase">%</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Processando</p>
                <p className="text-sm font-bold text-[#1C1C1C] mt-1">{activeStep?.label ?? 'Finalizando artefato'}</p>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              {steps.map((step, idx) => {
                const isDone = activeIndex > idx;
                const isCurrent = activeIndex === idx;
                return (
                  <div
                    key={step.id}
                    className={`flex items-start gap-3 rounded-sm border px-4 py-3 transition-all ${isCurrent
                      ? 'border-[#005691]/60 bg-[#E8F1F9] shadow-sm'
                      : isDone
                        ? 'border-[#78BE20]/30 bg-[#F3FBEE]'
                        : 'border-gray-200 bg-white'
                      }`}
                  >
                    <div
                      className={`mt-1 h-6 w-6 flex items-center justify-center rounded-full text-[10px] font-bold border ${isDone
                        ? 'bg-[#78BE20] text-white border-[#4c7c13]'
                        : isCurrent
                          ? 'bg-[#005691] text-white border-[#003a63] animate-pulse'
                          : 'bg-gray-50 text-gray-400 border-gray-200'
                        }`}
                    >
                      {isDone ? '✓' : idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1C1C1C]">{step.label}</p>
                      <p className="text-xs text-gray-500">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Status do Sistema</p>
              <span className="text-[10px] font-mono text-gray-400">Aido Live Feed</span>
            </div>
            <div className="bg-[#F7F9FB] border border-gray-200 rounded-sm p-4 max-h-40 overflow-y-auto custom-scrollbar">
              {logs.length === 0 && (
                <p className="text-xs text-gray-400">Iniciando processamento...</p>
              )}
              {logs.map((log, index) => (
                <div key={index} className="flex items-start gap-2 py-1 text-xs text-gray-700">
                  <span className="text-[#005691] mt-0.5">●</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  // Application State
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('login');
  const [documents, setDocuments] = useState<AidoDocument[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);

  // Settings State
  const [settings, setSettings] = useState<AppSettings>({
    agentModel: ProcessingMode.DEEP,
    transcriptionModel: 'gemini-2.5-flash',
    autoDownloadManual: true,
    autoDownloadTranscript: true,
    themeMode: 'light'
  });

  // Workspace Layout State (Resizable Splitter)
  const [leftPanelWidth, setLeftPanelWidth] = useState(320); // Default width in px
  const [isDragging, setIsDragging] = useState(false);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState(''); // New: Session/Manual Title
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTemplate, setUploadTemplate] = useState<File | null>(null); // Template State
  const [uploadInstructions, setUploadInstructions] = useState('');
  const [uploadTranscript, setUploadTranscript] = useState<File | null>(null);
  const [targetLanguage, setTargetLanguage] = useState('Português'); // Language Selection
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);

  // Pipeline State
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>(PipelineStage.IDLE);
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([]);
  const [pipelineOverlayDismissed, setPipelineOverlayDismissed] = useState(false);

  // Manual State
  const [manualDrafts, setManualDrafts] = useState<Record<string, ManualDraft>>({});
  const [isSavingManual, setIsSavingManual] = useState(false);
  const downloadTrackerRef = useRef<Record<string, { manual?: boolean; transcript?: boolean }>>({});

  // Sync MSAL user to App state
  useEffect(() => {
    if (isAuthenticated && accounts[0]) {
      const account = accounts[0];
      setUser({
        id: account.localAccountId,
        name: account.name || "Usuário",
        email: account.username,
        avatar: "https://ui-avatars.com/api/?name=" + (account.name || "User"),
        role: "admin" // Default role
      });
      setView('dashboard');
    } else {
      setUser(null);
      setView('login');
    }
  }, [isAuthenticated, accounts]);

  // Resizable Logic
  const startResizing = React.useCallback(() => {
    setIsDragging(true);
  }, []);

  const stopResizing = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  const resize = React.useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isDragging) {
        // Constrain width between 250px and 600px
        const newWidth = Math.min(Math.max(mouseMoveEvent.clientX - 64, 250), 600); // 64 is Sidebar width roughly
        setLeftPanelWidth(newWidth);
      }
    },
    [isDragging]
  );

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  useEffect(() => {
    documents.forEach(doc => {
      if (doc.status !== 'ready') return;

      if (settings.autoDownloadManual && doc.manualDocxPath && !hasAutoDownloaded(doc.id, 'manual')) {
        downloadManualFile(doc)
          .then(() => markAutoDownloaded(doc.id, 'manual'))
          .catch(err => console.error('Manual auto-download failed:', err));
      }

      if (settings.autoDownloadTranscript && doc.transcriptPath && !hasAutoDownloaded(doc.id, 'transcript')) {
        downloadTranscriptFile(doc)
          .then(() => markAutoDownloaded(doc.id, 'transcript'))
          .catch(err => console.error('Transcript auto-download failed:', err));
      }
    });
  }, [documents, settings.autoDownloadManual, settings.autoDownloadTranscript]);

  // --- Actions ---

  const handleLogin = async () => {
    try {
      await instance.loginPopup(loginRequest);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    instance.logoutPopup().catch(e => console.error(e));
    setUser(null);
    setView('login');
    setActiveDocId(null);
  };

  const MEDIA_MIME_WHITELIST = ['audio/mpeg', 'audio/mp3', 'video/mp4'];
  const canSubmitUpload = !!(uploadFile || uploadInstructions.trim() || uploadTranscript);

  const addLog = (msg: string) => {
    setPipelineLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-10));
  };

  const triggerBrowserDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const element = document.createElement('a');
    element.href = url;
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
  };

  const downloadManualFile = async (doc: AidoDocument) => {
    if (!doc.manualDocxPath) return;
    const response = await fetch(`${CONFIG.API_BASE_URL}${doc.manualDocxPath}`);
    if (!response.ok) throw new Error('Falha ao baixar DOCX gerado.');
    const blob = await response.blob();
    triggerBrowserDownload(blob, `${doc.name}_manual.docx`);
  };

  const downloadTranscriptFile = async (doc: AidoDocument) => {
    if (!doc.transcriptPath) return;
    const response = await fetch(`${CONFIG.API_BASE_URL}${doc.transcriptPath}`);
    if (!response.ok) throw new Error('Falha ao baixar transcrição.');
    const text = await response.text();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    triggerBrowserDownload(blob, `${doc.name}_transcricao.txt`);
  };

  const hasAutoDownloaded = (docId: string, type: 'manual' | 'transcript') => {
    return Boolean(downloadTrackerRef.current[docId]?.[type]);
  };

  const markAutoDownloaded = (docId: string, type: 'manual' | 'transcript') => {
    downloadTrackerRef.current[docId] = {
      ...downloadTrackerRef.current[docId],
      [type]: true
    };
  };

  // System Status State
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    postgres: 'active',
    whisper: 'inactive',
    adk: 'ready',
    auth: 'active'
  });

  // Fetch System Status periodically
  useEffect(() => {
    const fetchStatus = async () => {
      const status = await getSystemStatus();
      setSystemStatus(prev => ({ ...prev, ...status }));
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  // Run Real Pipeline via SSE
  const runSequentialPipeline = async (payload: PipelineRunPayload) => {
    setPipelineStage(PipelineStage.TRANSCRIPTION);
    setPipelineProgress(0);
    addLog("Inicializando conexão com o pipeline...");
    setPipelineOverlayDismissed(false);

    setSystemStatus(prev => ({
      ...prev,
      adk: 'active',
      whisper: payload.fileToken ? 'active' : prev.whisper
    }));

    runPipelineSSE(
      payload,
      (eventType, data) => {
        if (eventType === 'init') {
          addLog(typeof data === 'string' ? data : data?.log || 'Pipeline inicializado.');
        } else if (eventType === 'progress') {
          setPipelineStage(data.stage); // Ensure stage matches enum or string from backend
          setPipelineProgress(data.progress);
          if (data.stage) {
            setSystemStatus(prev => ({
              ...prev,
              adk: 'active',
              whisper: data.stage === PipelineStage.TRANSCRIPTION ? 'active' : (prev.whisper === 'error' ? 'error' : 'inactive')
            }));
          }
          if (data.log) addLog(data.log);
        } else if (eventType === 'error') {
          addLog(data?.message || 'Erro no pipeline.');
          setPipelineStage(PipelineStage.IDLE);
          setDocuments(prev => prev.map(d => d.id === payload.docId ? { ...d, status: 'error' } : d));
          setIsProcessingUpload(false);
          setSystemStatus(prev => ({
            ...prev,
            adk: 'ready',
            whisper: prev.whisper === 'error' ? 'error' : 'inactive'
          }));
        } else if (eventType === 'complete') {
          setPipelineStage(PipelineStage.COMPLETED);
          addLog("Execução do pipeline finalizada com sucesso.");

          // Update document with final content
          setDocuments(prev => prev.map(d => d.id === payload.docId ? {
            ...d,
            status: 'ready',
            manualContent: data.manual_content,
            manualDocxPath: data.manual_docx_path ?? undefined,
            transcriptPath: data.transcript_path ?? d.transcriptPath
          } : d));

          setManualDrafts(prev => ({
            ...prev,
            [payload.docId]: {
              content: data.manual_content || '',
              updatedAt: data.updated_at || null,
              isDirty: false
            }
          }));

          // Auto-fetch transcript if path provided
          if (data.transcript_path) {
            // Ensure we don't get 404 by waiting a tiny bit or just retrying
            setTimeout(() => {
              fetch(`${CONFIG.API_BASE_URL}${data.transcript_path}`)
                .then(res => {
                  if (!res.ok) throw new Error('Falha ao baixar transcrição.');
                  return res.text();
                })
                .then(text => {
                  setDocuments(prev => prev.map(d => d.id === payload.docId ? {
                    ...d,
                    content: text,
                    transcriptPath: data.transcript_path
                  } : d));
                })
                .catch(err => {
                  console.error('Transcript retrieval failed:', err);
                });
            }, 1000);
          }

          setSystemStatus(prev => ({
            ...prev,
            adk: 'ready',
            whisper: prev.whisper === 'error' ? 'error' : 'inactive'
          }));
        }
      },
      (err) => {
        console.error("Pipeline Error:", err);
        addLog("ERRO CRÍTICO: Conexão perdida com o pipeline.");
        setPipelineStage(PipelineStage.IDLE);
        setSystemStatus(prev => ({
          ...prev,
          adk: 'ready',
          whisper: prev.whisper === 'error' ? 'error' : 'inactive'
        }));
      }
    );
  };

  const handleTranscribeAndUpload = async () => {
    if (!canSubmitUpload) return;

    setIsProcessingUpload(true);
    
    // Append language instruction
    const languageInstruction = `O manual final DEVE ser gerado no idioma: ${targetLanguage}. Traduza todo o conteúdo necessário para ${targetLanguage}.`;
    const finalInstructions = uploadInstructions ? `${uploadInstructions}\n\n${languageInstruction}` : languageInstruction;

    const docId = crypto.randomUUID();

    // Use the custom title if provided, otherwise fallback logic
    let docName = uploadTitle.trim();
    if (!docName) {
      if (uploadFile) docName = uploadFile.name;
      else if (uploadTranscript) docName = uploadTranscript.name;
      else docName = `Sessão ${new Date().toLocaleTimeString()}`;
    }

    let docType = DocumentType.TEXT_PLAIN;
    if (uploadFile) {
      docType = uploadFile.type as DocumentType;
    }

    const newDoc: AidoDocument = {
      id: docId,
      name: docName,
      type: docType,
      uploadDate: new Date().toISOString(),
      status: 'uploading', // Will move to 'processing' in pipeline
      instructions: finalInstructions || undefined,
    };

    setDocuments(prev => [newDoc, ...prev].slice(0, 10));
    setIsUploadModalOpen(false);

    // Reset fields
    setUploadTitle('');
    setUploadFile(null);
    setUploadTemplate(null);
    setUploadInstructions('');
    setUploadTranscript(null);
    setTargetLanguage('Português');

    // 1. Enter Workspace immediately
    setActiveDocId(newDoc.id);
    setView('workspace');

    // Force overlay to show
    setPipelineOverlayDismissed(false);
    setPipelineStage(PipelineStage.TRANSCRIPTION);

    addLog(`Iniciando upload para "${docName}"...`);

    let uploadResult: { text_content?: string; file_token?: string | null; template_token?: string | null } = {};
    
    // Upload Media
    if (uploadFile) {
      try {
        const response = await uploadDocument(uploadFile, docId);
        uploadResult.text_content = response.text_content;
        uploadResult.file_token = response.file_token || null;
        addLog(`Upload de mídia concluído (${response.filename}).`);
      } catch (e) {
        console.error(e);
        addLog("Falha no upload de mídia.");
        setIsProcessingUpload(false);
        return;
      }
    }

    // Upload Template (if exists)
    if (uploadTemplate) {
      try {
        addLog(`Enviando template personalizado...`);
        const response = await uploadDocument(uploadTemplate, docId);
        // We assume the backend saves it and returns the path in file_token (or we might need to adjust backend to distinguish, 
        // but for now let's assume uploadDocument returns the path in file_token and we store it as template_token locally)
        // Actually, checking uploadDocument implementation: it returns file_token.
        uploadResult.template_token = response.file_token || null;
        addLog(`Template carregado.`);
      } catch (e) {
        console.error(e);
        addLog("Falha no upload do template. Usando padrão.");
      }
    }

    // 2. START PIPELINE
    setPipelineLogs([]);
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'processing' } : d));

    const pipelinePayload: PipelineRunPayload = {
      docId,
      textContent: uploadResult.text_content || undefined,
      fileToken: uploadResult.file_token ?? null,
      templateToken: uploadResult.template_token ?? null,
      instructions: finalInstructions || null,
    };

    await runSequentialPipeline(pipelinePayload);
    setIsProcessingUpload(false);
  };

  const openDocument = (doc: AidoDocument) => {
    setActiveDocId(doc.id);
    // If opening an existing ready doc, ensure pipeline is marked complete so we see chat
    if (doc.status === 'ready') {
      setPipelineStage(PipelineStage.COMPLETED);
      if (!manualDrafts[doc.id]) {
        fetchManual(doc.id)
          .then((payload) => {
            setManualDrafts(prev => ({
              ...prev,
              [doc.id]: {
                content: payload.content,
                updatedAt: payload.updated_at,
                isDirty: false
              }
            }));
            setDocuments(prev => prev.map(d => d.id === doc.id ? {
              ...d,
              manualDocxPath: payload.manual_docx_path ?? d.manualDocxPath,
              transcriptPath: payload.transcript_path ?? d.transcriptPath
            } : d));
          })
          .catch(err => addLog(`Falha ao carregar manual: ${err}`));
      }
    }
    setView('workspace');
  };


  const handleDocxDownload = async () => {
    if (!activeDocId) return;
    const doc = documents.find(d => d.id === activeDocId);
    const draft = manualDrafts[activeDocId];

    if (!doc) return;

    try {
      // If we have a draft or content, generate fresh DOCX from it to ensure edits are captured
      const contentToConvert = draft?.content || doc.manualContent;

      if (contentToConvert) {
        const response = await fetch(`${CONFIG.API_BASE_URL}/convert/docx`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: contentToConvert })
        });

        if (!response.ok) throw new Error('Falha ao gerar DOCX atualizado.');

        const blob = await response.blob();
        triggerBrowserDownload(blob, `${doc.name}_editado.docx`);
      } else if (doc.manualDocxPath) {
        // Fallback to original if no content text available (unlikely)
        await downloadManualFile(doc);
      }
    } catch (error) {
      console.error('DOCX download failed:', error);
      alert('Erro ao baixar DOCX. Tente salvar primeiro.');
    }
  };

  const handlePdfDownload = () => {
    window.print();
  };

  const handleTranscriptDownload = async () => {
    if (!activeDocId) return;
    const doc = documents.find(d => d.id === activeDocId);
    if (!doc || !doc.transcriptPath) return;

    try {
      await downloadTranscriptFile(doc);
      markAutoDownloaded(doc.id, 'transcript');
    } catch (error) {
      console.error('Transcript download failed:', error);
    }
  };

  // ... existing view logic ...
  const activeDocument = documents.find(d => d.id === activeDocId);
  const isPipelineActive = pipelineStage !== PipelineStage.COMPLETED && pipelineStage !== PipelineStage.IDLE;
  const showPipelineMonitor = isPipelineActive && !pipelineOverlayDismissed;


  return (
    <>
      <Layout
        user={user || MOCK_USER}
        onLogout={handleLogout}
        activeView={view}
        onChangeView={(v) => {
          setView(v);
          if (v === 'dashboard') setActiveDocId(null);
        }}
        systemStatus={systemStatus}
      >
        {/* LOGIN VIEW */}
        {view === 'login' && (
          <div className="flex-1 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none"></div>
            <div className="bg-white/80 backdrop-blur-md p-10 rounded-sm shadow-xl border border-gray-200 text-center max-w-md w-full relative z-10 animate-enter">
              <div className="w-16 h-16 bg-[#005691] text-white text-3xl font-bold flex items-center justify-center mx-auto mb-6 shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2" style={{ background: THEME.colors.supergraphic }}></div>
                A
              </div>
              <h1 className="text-2xl font-light text-[#1C1C1C] mb-1 tracking-tight">Entrar no Aido</h1>
              <p className="text-xs text-gray-500 font-mono mb-8 uppercase tracking-widest">Automação Inteligente de Documentos</p>

              <Button
                onClick={handleLogin}
                className="w-full !bg-[#2F2F2F] !hover:bg-[#1C1C1C] !shadow-lg"
                icon={<svg className="w-4 h-4" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="#f35325" d="M1 1h10v10H1z" /><path fill="#81bc06" d="M12 1h10v10H12z" /><path fill="#05a6f0" d="M1 12h10v10H1z" /><path fill="#ffba08" d="M12 12h10v10H12z" /></svg>}
              >
                Entrar com Microsoft
              </Button>

              <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col gap-1">
                <div className="text-[9px] text-gray-400 font-mono">ACESSO RESTRITO</div>
                <div className="text-[9px] text-gray-400 font-mono">GS/OBR12-LA1</div>
                <div className="text-[9px] text-gray-400 font-mono">Livro de Operações</div>
              </div>
            </div>
          </div>
        )}

        {/* UPLOAD MODAL */}
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#000] bg-opacity-30 backdrop-blur-sm" onClick={() => setIsUploadModalOpen(false)}></div>
            <div className="bg-white w-full max-w-lg rounded-sm shadow-2xl relative z-10 animate-enter overflow-hidden border border-gray-200">
              <div className="bg-[#F8F9FA] px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-sm font-bold uppercase tracking-wide text-[#1C1C1C]">Novo Manual Técnico</h2>
                <button onClick={() => setIsUploadModalOpen(false)} className="text-gray-400 hover:text-[#E20015] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <p className="text-xs text-gray-500 bg-blue-50 p-3 border-l-2 border-[#005691]">
                  <strong>Ingestão Flexível:</strong> Forneça um vídeo ou texto para iniciar a automação.
                </p>

                {/* 0. Session Title */}
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Título do Manual (Opcional)</label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="Ex: Manutenção da Bomba V2"
                    className="block w-full text-sm text-gray-800 border border-gray-300 rounded-sm p-2 focus:ring-1 focus:ring-[#005691] outline-none bg-white"
                  />
                </div>

                {/* 1. Source Media */}
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">1. Mídia Fonte (Opcional)</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".mp3,.mp4"
                      onChange={(e) => {
                        const fileCandidate = e.target.files?.[0] || null;
                        if (fileCandidate) {
                          const extension = fileCandidate.name.split('.').pop()?.toLowerCase();
                          const isAllowedMime = fileCandidate.type ? MEDIA_MIME_WHITELIST.includes(fileCandidate.type) : true;
                          const isAllowedExt = extension ? ['mp3', 'mp4'].includes(extension) : true;
                          if (!isAllowedMime || !isAllowedExt) {
                            addLog('Formato inválido. Utilize arquivos .mp3 ou .mp4.');
                            e.target.value = '';
                            setUploadFile(null);
                            return;
                          }
                        }
                        setUploadFile(fileCandidate);
                      }}
                      className="block w-full text-xs text-gray-500 border border-gray-300 rounded-sm p-1 cursor-pointer bg-gray-50"
                    />
                  </div>
                </div>

                {/* Template Upload */}
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Modelo de Documento (Template .docx)</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".docx"
                      onChange={(e) => {
                        const fileCandidate = e.target.files?.[0] || null;
                        setUploadTemplate(fileCandidate);
                      }}
                      className="block w-full text-xs text-gray-500 border border-gray-300 rounded-sm p-1 cursor-pointer bg-gray-50"
                    />
                    <p className="text-[9px] text-gray-400 mt-1">Se não fornecido, será usado o formato padrão.</p>
                  </div>
                </div>

                {/* Language Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Idioma do Manual</label>
                  <select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="block w-full text-sm text-gray-800 border border-gray-300 rounded-sm p-2 focus:ring-1 focus:ring-[#005691] outline-none bg-white"
                  >
                    <option value="Português">Português (Brasil)</option>
                    <option value="Inglês">Inglês (US)</option>
                    <option value="Alemão">Alemão (Deutsch)</option>
                    <option value="Espanhol">Espanhol (Español)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">2. Instruções Adicionais (Opcional)</label>
                    <textarea
                      value={uploadInstructions}
                      onChange={(e) => setUploadInstructions(e.target.value)}
                      placeholder="Ex: Focar nas especificações técnicas..."
                      className="block w-full text-sm text-gray-800 border border-gray-300 rounded-sm p-2 h-20 focus:ring-1 focus:ring-[#005691] outline-none bg-white resize-none"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-[#F8F9FA] px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>Cancelar</Button>
                <Button
                  onClick={handleTranscribeAndUpload}
                  disabled={!canSubmitUpload || isProcessingUpload}
                  isLoading={isProcessingUpload}
                  className="!bg-[#005691] !text-white hover:!bg-[#004a7c]"
                >
                  {isProcessingUpload ? 'Processando...' : 'Iniciar Pipeline'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* DASHBOARD VIEW */}
        {view === 'dashboard' && (
          <div className="flex-1 p-8 overflow-y-auto bg-[#F4F7F9]">
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-2xl font-light text-[#1C1C1C]">Biblioteca de Documentos</h2>
                  <p className="text-sm text-gray-500 mt-1">Gerencie seus artefatos de documentação automatizada.</p>
                </div>
                <Button onClick={() => setIsUploadModalOpen(true)} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}>
                  Novo Documento
                </Button>
              </div>

              {documents.length === 0 ? (
                <div className="bg-white rounded-sm border border-gray-200 p-12 text-center shadow-sm">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum documento ainda</h3>
                  <p className="text-gray-500 text-sm mb-6">Comece fazendo upload de um vídeo ou fornecendo instruções.</p>
                  <Button variant="outline" onClick={() => setIsUploadModalOpen(true)}>Criar Primeiro Documento</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents.map((doc) => (
                    <div key={doc.id} onClick={() => openDocument(doc)} className="group bg-white rounded-sm border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-[#005691] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="flex justify-between items-start mb-3">
                        <div className="w-10 h-10 bg-blue-50 text-[#005691] rounded-sm flex items-center justify-center font-bold text-xs border border-blue-100">
                          {doc.type === DocumentType.VIDEO_MP4 ? 'MP4' : 'TXT'}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm ${doc.status === 'ready' ? 'bg-[#F3FBEE] text-[#4c7c13]' :
                          doc.status === 'processing' ? 'bg-[#E8F1F9] text-[#005691]'
                            : 'bg-gray-100 text-gray-500'
                          }`}>
                          {doc.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-[#1C1C1C] truncate mb-1 group-hover:text-[#005691] transition-colors">{doc.name}</h3>
                      <p className="text-xs text-gray-500 mb-4 line-clamp-2">{doc.instructions || "Sem instruções adicionais."}</p>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono border-t border-gray-100 pt-3">
                        <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                        <span>ID: {doc.id.slice(0, 6)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* WORKSPACE VIEW */}
        {view === 'workspace' && activeDocument && (
          <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            {/* Pipeline Monitor Overlay */}
            {showPipelineMonitor && (
              <div className="absolute inset-0 z-50 bg-white">
                <PipelineMonitor stage={pipelineStage} progress={pipelineProgress} logs={pipelineLogs} />
              </div>
            )}

            {/* Header */}
            <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0 z-20 shadow-sm">
              <div className="flex items-center gap-4">
                <button onClick={() => setView('dashboard')} className="text-gray-400 hover:text-[#1C1C1C] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <div>
                  <h2 className="text-sm font-bold text-[#1C1C1C] leading-none">{activeDocument.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-gray-500 font-mono uppercase">Workspace Ativo</span>
                    <span className="w-1 h-1 bg-[#78BE20] rounded-full"></span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Actions */}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden bg-[#F4F7F9]">
              {/* Left Panel: Artifact Rack */}
              <div
                className="flex-shrink-0 bg-white border-r border-gray-200 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10"
                style={{ width: leftPanelWidth }}
              >
                <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-white">
                  <div className="w-2 h-2 rounded-full bg-[#005691]"></div>
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">Rack de Artefatos</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-gray-50/50">
                  {/* 1. Source Media */}
                  <ArtifactNode
                    label="Mídia Fonte"
                    subLabel={activeDocument.type === DocumentType.VIDEO_MP4 ? "video/mp4" : "text/plain"}
                    status="active"
                    type="IN"
                  />

                  {/* 2. Transcript Log */}
                  <ArtifactNode
                    label="Log de Transcrição"
                    subLabel={activeDocument.transcriptPath ? "Disponível" : "Pendente"}
                    status={activeDocument.transcriptPath ? 'active' : 'inactive'}
                    type="TXT"
                    content={activeDocument.content}
                    actionIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
                    onAction={handleTranscriptDownload}
                  />

                  {/* 3. Context Instructions */}
                  <ArtifactNode
                    label="Instruções de Contexto"
                    subLabel={activeDocument.instructions ? "Regras Personalizadas" : "Nenhuma"}
                    status={activeDocument.instructions ? 'active' : 'inactive'}
                    type="CTX"
                    content={activeDocument.instructions}
                  />

                  {/* 4. Generated Manual */}
                  <ArtifactNode
                    label="Manual Gerado"
                    subLabel="Saída Final"
                    status={activeDocument.manualContent ? 'active' : 'pending'}
                    type="OUT"
                    content={activeDocument.manualContent}
                    actionIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
                    onAction={handleDocxDownload} // Use handleDocxDownload for quick action icon
                  />
                </div>
              </div>

              {/* Resizer Handle */}
              <div
                className="w-1 bg-gray-200 hover:bg-[#005691] cursor-col-resize transition-colors z-30 flex items-center justify-center"
                onMouseDown={startResizing}
              >
                <div className="h-8 w-0.5 bg-gray-400 rounded-full"></div>
              </div>

              {/* Right Panel: Manual Editor */}
              <div className="flex-1 bg-white relative">
                {activeDocument.manualContent ? (
                  <ManualEditor
                    document={activeDocument}
                    draft={manualDrafts[activeDocument.id]}
                    onChange={(val) => {
                      setManualDrafts(prev => ({
                        ...prev,
                        [activeDocument.id]: {
                          content: val,
                          updatedAt: new Date().toISOString(),
                          isDirty: true
                        }
                      }));
                    }}
                    onSave={async () => {
                      setIsSavingManual(true);
                      try {
                        const contentToSave = manualDrafts[activeDocument.id]?.content || activeDocument.manualContent || '';
                        await saveManualContent(activeDocument.id, contentToSave);
                        setManualDrafts(prev => ({
                          ...prev,
                          [activeDocument.id]: {
                            content: contentToSave,
                            updatedAt: new Date().toISOString(),
                            isDirty: false
                          }
                        }));
                        setDocuments(prev => prev.map(d => d.id === activeDocument.id ? { ...d, manualContent: contentToSave } : d));
                      } catch (e) {
                        console.error(e);
                        addLog(`Erro ao salvar: ${e}`);
                      } finally {
                        setIsSavingManual(false);
                      }
                    }}
                    onDownloadDocx={handleDocxDownload}
                    onDownloadPdf={() => {}} // Disabled as per request
                    // Placeholder function for removed prop, not used in new design
                    onDownloadTxt={() => {}} 
                    systemStatus={systemStatus}
                    isSaving={isSavingManual}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <p className="text-sm">Aguardando saída do pipeline...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Layout>
    </>
  );
};

const AppWithAuth = () => (
  <MsalProvider instance={msalInstance}>
    <AppContent />
  </MsalProvider>
);

export default AppWithAuth;