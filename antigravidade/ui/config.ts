
// Centralized configuration as per architecture requirements
// Equivalent to app/config.py in the python backend

export const CONFIG = {
  // Agent Configuration
  AGENT_MODEL_NAME: "gemini-3-pro-preview", // The 'Deep' reasoning agent
  
  // Local Transcription Simulation (Simulating Whisper + FFMPEG)
  TRANSCRIPTION_MODEL: "gemini-2.5-flash", 
  
  // App Settings
  APP_NAME: "Aido",
  APP_VERSION: "1.0.0",
  ENV: "development",
  
  // Simulated Backend Config
  API_BASE_URL: "http://localhost:8000",
  DB_CONNECTION_STRING: "postgresql://user:pass@localhost:5432/aido_db"
};
