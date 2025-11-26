import { ChatMessage, NodeStatus } from "../types";
import { CONFIG } from "../config";

// URL do Backend Local (via Proxy ou direto)
// URL do Backend Local (via Proxy ou direto)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface SystemStatus {
  postgres: NodeStatus;
  whisper: NodeStatus;
  adk: NodeStatus;
  auth: NodeStatus;
}

export interface SystemConfig {
  models: { id: string; name: string }[];
  default_model: string;
}

/**
 * Converts a File object to a Base64 string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

export const getSystemStatus = async (): Promise<SystemStatus> => {
  try {
    const res = await fetch(`${API_URL}/system/status`);
    if (!res.ok) throw new Error("Status check failed");
    return await res.json();
  } catch (e) {
    console.error(e);
    return { postgres: 'error', whisper: 'error', adk: 'error', auth: 'error' };
  }
};

export const getSystemConfig = async (): Promise<SystemConfig> => {
  try {
    const res = await fetch(`${API_URL}/system/config`);
    if (!res.ok) throw new Error("Config check failed");
    return await res.json();
  } catch (e) {
    return { models: [], default_model: 'gemini-2.5-flash' };
  }
};

/**
 * Uploads a file to the backend for transcription/processing.
 */
export interface UploadResponse {
  filename: string;
  transcription?: string;
  text_content?: string;
  file_token?: string;
}

export const uploadDocument = async (
  file: File,
  docId: string,
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('doc_id', docId);

  try {
    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      transcription: data.transcription || "",
      filename: data.filename,
      text_content: data.text_content,
      file_token: data.file_token,
    };
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

/**
 * Runs the real sequential pipeline via SSE.
 */
export interface PipelineRunPayload {
  docId: string;
  textContent?: string;
  fileToken?: string | null;
  templateToken?: string | null; // New: Template file path
  instructions?: string | null;
}

export const runPipelineSSE = (
  payload: PipelineRunPayload,
  onEvent: (event: string, data: any) => void,
  onError: (err: any) => void
) => {
  fetch(`${API_URL}/pipeline/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      doc_id: payload.docId,
      text_content: payload.textContent,
      file_token: payload.fileToken,
      template_token: payload.templateToken, // Send to backend
      instructions: payload.instructions,
    })
  }).then(async response => {
    if (!response.ok || !response.body) throw new Error("Pipeline start failed");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || ""; // Keep incomplete chunk

      for (const line of lines) {
        const eventMatch = line.match(/^event: (.*)$/m);
        const dataMatch = line.match(/^data: (.*)$/m);

        if (eventMatch && dataMatch) {
          const eventType = eventMatch[1].trim();
          const eventData = JSON.parse(dataMatch[1].trim());
          onEvent(eventType, eventData);
        }
      }
    }
  }).catch(onError);
};

export interface ManualResponse {
  doc_id: string;
  content: string;
  manual_docx_path?: string;
  transcript_path?: string;
  updated_at?: string;
}

export const fetchManual = async (docId: string): Promise<ManualResponse> => {
  const response = await fetch(`${API_URL}/manual/${docId}`);
  if (!response.ok) {
    throw new Error('Manual não encontrado');
  }
  return response.json();
};

export const saveManualContent = async (docId: string, content: string) => {
  const response = await fetch(`${API_URL}/manual/${docId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Falha ao salvar manual');
  }

  return response.json();
};

/**
 * Creates a chat session and returns a generator for streaming responses.
 * Connects to the Python Backend running Google ADK.
 */
export async function* streamChatResponse(
  message: string,
  history: ChatMessage[],
  contextContent?: string,
  modelName: string = CONFIG.AGENT_MODEL_NAME,
  sessionId?: string | null
): AsyncGenerator<string, void, unknown> {

  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        history: history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
        session_id: sessionId || 'default_session',
        context: contextContent || null
      })
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      yield chunk;
    }

  } catch (error) {
    console.error("Stream error:", error);
    yield "Erro: Falha na conexão com o Agente Aido (Backend). Verifique se o servidor Python está rodando.";
  }
}
