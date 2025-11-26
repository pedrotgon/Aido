
import React, { useState } from 'react';
import { User, ViewState, SystemStatus } from '../types';
import { THEME } from '../constants';
import { CONFIG } from '../config';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  activeView: ViewState;
  onChangeView: (view: ViewState) => void;
  systemStatus: SystemStatus;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, activeView, onChangeView, systemStatus }) => {
  // State for collapsible sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-[#F4F7F9] overflow-hidden font-sans text-[#1C1C1C]">
      {/* Background Pattern: 21st.dev style technical grid */}
      <div className="absolute inset-0 bg-dot-grid pointer-events-none z-0 opacity-60"></div>

      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white shadow-[0_1px_0px_rgba(0,0,0,0.06)] z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-8">
          {/* Brand Logo Area - Rigid Box */}
          <div className="flex items-center gap-3 group cursor-default">
            <div className="relative w-8 h-8 flex items-center justify-center bg-[#005691] text-white font-bold text-lg overflow-hidden shadow-sm group-hover:bg-[#004475] transition-colors">
              {/* Supergraphic Strip on top of Logo */}
              <div className="absolute top-0 left-0 right-0 h-1" style={{ background: THEME.colors.supergraphic }}></div>
              A
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-bold text-[#1C1C1C] tracking-tight">Aido</span>
              <span className="text-[9px] text-gray-500 uppercase tracking-[0.2em] font-medium">Automação</span>
            </div>
          </div>

          {/* Main Nav - Technical Tabs */}
          <nav className="hidden md:flex items-center gap-1 ml-4 border-l border-gray-200 pl-6 h-8">
            <button
              onClick={() => onChangeView('dashboard')}
              className={`px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-all rounded-sm ${activeView === 'dashboard' || activeView === 'workspace'
                  ? 'bg-[#005691] text-white shadow-sm'
                  : 'text-gray-500 hover:text-[#005691] hover:bg-gray-50'
                }`}
            >
              Banco de Memória
            </button>
            <button
              onClick={() => onChangeView('settings')}
              className={`px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-all rounded-sm ${activeView === 'settings'
                  ? 'bg-[#005691] text-white shadow-sm'
                  : 'text-gray-500 hover:text-[#005691] hover:bg-gray-50'
                }`}
            >
              Configurações
            </button>
          </nav>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block leading-tight">
            <p className="text-xs font-bold text-gray-800">{user.name}</p>
            <p className="text-[10px] text-gray-500 font-mono">{user.role || 'AzureAD::User'}</p>
          </div>
          <div className="relative group">
            <img
              src={user.avatarUrl || user.avatar || 'https://ui-avatars.com/api/?name=Aido'}
              alt={user.name}
              className="w-8 h-8 rounded-sm border border-gray-200 shadow-sm cursor-pointer hover:ring-2 hover:ring-[#005691] transition-all"
              onClick={onLogout}
            />
            {/* Active Status Indicator */}
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#78BE20] border-2 border-white rounded-full"></div>
          </div>
        </div>

        {/* Supergraphic Bottom Border - The Bosch Identity */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: THEME.colors.supergraphic }}></div>
      </header>

      {/* Main Container */}
      <div className="flex w-full pt-14 h-full z-10 relative">
        {/* Expandable Sidebar - Server Rack Style */}
        <aside
          className={`${isSidebarOpen ? 'w-64' : 'w-16'} bg-[#151515] text-white hidden md:flex flex-col border-r border-gray-800 shadow-xl relative z-20 transition-all duration-300 ease-in-out`}
        >
          {/* Noise texture */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%221%22/%3E%3C/svg%3E")' }}></div>

          {/* Toggle Handle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute -right-3 top-6 w-6 h-6 bg-[#2F2F2F] border border-gray-600 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#005691] hover:border-[#005691] transition-all z-50 shadow-md"
          >
            <svg className={`w-3 h-3 transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="flex-1 flex flex-col gap-2 pt-8 px-4 relative z-10 overflow-hidden">
            {/* System Nodes removed as per request */}
          </div>

          {/* Footer Signature - Operations Book to Report */}
          <div className={`py-6 relative z-10 flex flex-col items-center gap-2 border-t border-gray-800 mx-4 transition-all duration-300 ${!isSidebarOpen ? 'border-transparent' : ''}`}>
            {isSidebarOpen ? (
              <div className="text-center">
                <div className="text-xs font-bold text-gray-300">GS/OBR12-LA1</div>
                <div className="text-[9px] text-gray-600 font-mono mt-1">Livro de Operações</div>
              </div>
            ) : (
              <div className="text-[8px] text-gray-600 font-mono writing-vertical-rl rotate-180 py-2">
                GS/OBR12-LA1
              </div>
            )}
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 relative overflow-hidden flex flex-col bg-[#F4F7F9]">
          {children}
        </main>
      </div>
    </div>
  );
};

// Helper Component for Sidebar Nodes - Kept for potential future use or if artifacts use it, but removed from main render
const SystemNode = ({ isOpen, label, subLabel, status, pulse, type }: { isOpen: boolean, label: string, subLabel: string, status: string, pulse?: boolean, type: string }) => {
  return (
    <div className={`flex items-center gap-3 p-2 rounded-sm transition-all duration-200 ${isOpen ? 'hover:bg-white/5' : 'justify-center'}`}>
      {/* Visual Indicator (The "Green Dot" or Icon) */}
      <div className="relative flex-shrink-0">
        <div className={`w-8 h-8 rounded-sm flex items-center justify-center font-mono text-[10px] font-bold border border-gray-700 ${status === 'active' || status === 'ready' ? 'bg-[#1C1C1C] text-[#78BE20]' : 'bg-red-900/20 text-red-500'}`}>
          {type}
        </div>
        {/* Status Dot */}
        <div className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 border-2 border-[#151515] rounded-full ${status === 'active' || status === 'ready' ? 'bg-[#78BE20]' : 'bg-red-500'} ${pulse ? 'animate-pulse' : ''}`}></div>
      </div>

      {/* Text Details (Only visible when open) */}
      {isOpen && (
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold text-gray-200 truncate leading-none mb-1">{label}</span>
          <span className="text-[9px] font-mono text-gray-500 truncate">{subLabel}</span>
        </div>
      )}
    </div>
  );
};

export default Layout;
