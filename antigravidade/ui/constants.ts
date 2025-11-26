
import { CONFIG } from './config';

export const APP_NAME = CONFIG.APP_NAME;
export const APP_VERSION = CONFIG.APP_VERSION;

// Visual Identity Constants (Bosch Design System + Modern Tech)
export const THEME = {
  colors: {
    // Primary Brand
    boschRed: '#E20015', // Fixed Bosch Red
    boschBlue: '#005691', // Fixed Bosch Blue
    boschLightBlue: '#008ECF',
    boschTurquoise: '#00A8B0',
    boschGreen: '#78BE20',
    boschPurple: '#963CBD',
    
    // Neutrals (Technical Scale)
    black: '#000000',
    darkGray: '#1C1C1C', // Primary Text
    midGray: '#87909C', // Secondary Text / Borders
    lightGray: '#EFF1F3', // Backgrounds
    white: '#FFFFFF',
    
    // Semantic
    success: '#78BE20', // Bosch Green
    warning: '#FFCF00',
    error: '#E20015',
    
    // The Supergraphic Gradient (Strict definition)
    supergraphic: 'linear-gradient(90deg, #9F0F17 0%, #E20015 18%, #963CBD 35%, #005691 55%, #008ECF 75%, #00A8B0 90%, #78BE20 100%)'
  }
};

// Mock Data for UI Simulation
export const MOCK_USER = {
  id: 'usr_123456',
  name: 'Pedro T. Gon',
  email: 'pedro@aido.ai',
  role: 'System Architect',
  avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=PG&backgroundColor=005691&textColor=ffffff'
};

export const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'audio/mpeg',
  'audio/wav',
  'video/mp4'
];