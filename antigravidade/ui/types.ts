
export enum DocumentType {
  PDF = 'application/pdf',
  IMAGE_PNG = 'image/png',
  IMAGE_JPEG = 'image/jpeg',
  AUDIO_MP3 = 'audio/mpeg',
  AUDIO_WAV = 'audio/wav',
  VIDEO_MP4 = 'video/mp4',
  TEXT_PLAIN = 'text/plain',
  UNKNOWN = 'application/octet-stream'
}

export enum PipelineStage {
  IDLE = 'idle',
  TRANSCRIPTION = 'TRANSCRIPTION',
  STRUCTURING = 'STRUCTURING',
  MASTERING = 'MASTERING',
  JSON_CONVERTER = 'JSON_CONVERTER',
  WRITER = 'WRITER',
  COMPLETED = 'completed'
}

export interface AidoDocument {
  id: string;
  name: string;
  type: DocumentType;
  uploadDate: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  summary?: string;
  content?: string; // Extracted text or transcription
  manualContent?: string; // The generated manual content
  manualDocxPath?: string; // Backend route for downloading the DOCX
  transcriptPath?: string; // Backend route for downloading transcript text
  instructions?: string; // Custom guidance provided during upload
  // Visual Memory Artifacts
  topics?: string[];
  entities?: string[];
  sentiment?: 'technical' | 'neutral' | 'critical';
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  avatar?: string;
  role?: string;
}

export interface ManualDraft {
  content: string;
  updatedAt?: string | null;
  isDirty: boolean;
}

export interface AppSettings {
  agentModel: ProcessingMode;
  transcriptionModel: string;
  autoDownloadManual: boolean;
  autoDownloadTranscript: boolean;
  themeMode: 'light' | 'dark';
}

export enum ProcessingMode {
  FAST = 'gemini-2.5-flash',
  DEEP = 'gemini-3-pro-preview',
}

export type ViewState = 'login' | 'dashboard' | 'workspace' | 'settings';

export type NodeStatus = 'active' | 'ready' | 'inactive' | 'error';

export interface SystemStatus {
  postgres: NodeStatus;
  whisper: NodeStatus;
  adk: NodeStatus;
  auth: NodeStatus;
}
