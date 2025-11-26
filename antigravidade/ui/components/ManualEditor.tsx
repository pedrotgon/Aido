import React, { useRef } from 'react';
import Button from './Button';
import { AidoDocument, ManualDraft, SystemStatus } from '../types';

interface ManualEditorProps {
  document: AidoDocument;
  draft?: ManualDraft;
  onChange: (value: string) => void;
  onSave: () => void | Promise<void>;
  onDownloadTxt: () => void;
  onDownloadDocx: () => void;
  onDownloadPdf: () => void;
  systemStatus: SystemStatus;
  isSaving: boolean;
}

const ManualEditor: React.FC<ManualEditorProps> = ({
  document,
  draft,
  onChange,
  onSave,
  onDownloadTxt,
  onDownloadDocx,
  onDownloadPdf,
  systemStatus,
  isSaving,
}) => {
  if (!document) return null;

  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const editorValue = draft?.content ?? document.manualContent ?? document.content ?? '';
  
  const friendlyDate = draft?.updatedAt
    ? new Date(draft.updatedAt).toLocaleString()
    : document.manualDocxPath
    ? 'Sincronizado com pipeline'
    : 'Nunca salvo';
    
  const statusEntries = [
    { label: 'ADK', value: systemStatus.adk },
    { label: 'Whisper', value: systemStatus.whisper },
    { label: 'Postgres', value: systemStatus.postgres },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#E8F1F9] relative h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm z-20 flex-shrink-0">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#005691] mb-1">Editor de Manual</p>
          <h1 className="text-xl font-bold text-[#1C1C1C] font-sans">{document.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] text-gray-400">Última atualização: {friendlyDate}</span>
            <div className="h-3 w-[1px] bg-gray-200"></div>
            <div className="flex gap-2">
              {statusEntries.map((entry) => (
                <span
                  key={entry.label}
                  className={`text-[9px] font-bold uppercase tracking-wider ${entry.value === 'active' ? 'text-[#4c7c13]' : 'text-gray-400'}`}
                >
                  {entry.label} ●
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onDownloadDocx}
            className="px-6 py-2.5 text-xs font-bold text-white bg-[#005691] hover:bg-[#004a7c] transition-colors rounded-sm shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Download DOCX
          </button>
        </div>
      </div>

      {/* Document Canvas */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar flex justify-center">
        <div className="w-full max-w-[210mm] bg-white shadow-lg min-h-[297mm] flex flex-col relative">
          {/* Bosch Header Stripe (Blue) */}
          <div className="h-2 w-full bg-gradient-to-r from-[#005691] via-[#008ECF] to-[#005691]"></div>
          
          <textarea
            ref={textAreaRef}
            value={editorValue}
            onChange={(event) => onChange(event.target.value)}
            className="flex-1 w-full p-[25mm] text-[11pt] leading-[1.5] text-[#1C1C1C] font-sans outline-none resize-none border-none bg-transparent"
            style={{ fontFamily: '"Bosch Office Sans", "Helvetica Neue", Helvetica, Arial, sans-serif' }}
            placeholder="Comece a editar o manual..."
            spellCheck={false}
          />
          
          {/* Page Footer */}
          <div className="h-[20mm] border-t border-gray-100 mx-[25mm] flex items-center justify-between text-[8pt] text-gray-400 font-sans">
            <span>Bosch Internal | {document.name}</span>
            <span>Page 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualEditor;
