
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

// Helper function to clean name (more robust against multiple prefixes/formats)
const getCleanedName = (fullName: string): string => {
  let cleaned = fullName.replace(/FIXED-TERM\s*/i, '').trim();
  // Add other prefixes to remove if they appear in names, e.g.,
  // cleaned = cleaned.replace(/DR\.\s*/i, '').trim();
  // cleaned = cleaned.replace(/MS\.\s*/i, '').trim();
  return cleaned;
};

// Helper function to generate initials
const getInitials = (fullName: string): string => {
  const cleanedName = getCleanedName(fullName);
  const parts = cleanedName.split(' ').filter(part => part.length > 0);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const MOCK_TEAM_MEMBERS = [
  { name: 'Souza Thayse', area: 'GS/OBR1-LA1' },
  { name: 'Moraes Lilian', area: 'GS/OBR12-LA1' },
  { name: 'Freire Karen', area: 'GS/OBR12-LA1' },
  { name: 'De Castro Teixeira Gabriela', area: 'GS/OBR12-LA1' },
  { name: 'Fochezatto Henrique', area: 'GS/OBR12-LA1' },
  { name: 'Andrade Bruna', area: 'GS/OBR12-LA1' },
  { name: 'Aquino Natalia', area: 'GS/OBR12-LA1' },
  { name: 'Espildora Santolaia Juliet', area: 'GS/OBR12-LA1' },
  { name: 'Falcari Beatriz', area: 'GS/OBR12-LA1' },
  { name: 'Fernandes Luam', area: 'GS/OBR12-LA1' },
  { name: 'Mercatelli Lais', area: 'GS/OBR12-LA1' },
  { name: 'Oliveira Nayara', area: 'GS/OBR12-LA1' },
  { name: 'Rocha Sofia', area: 'GS/OBR12-LA1' },
  { name: 'Monteiro Julia', area: 'GS/OBR1-LA1' },
  { name: 'Silvestre Gabriel', area: 'GS/OBR12-LA1' },
  { name: 'Gonçalves Pedro', area: 'GS/OBR12-LA1' },
].map(member => {
  const initials = getInitials(member.name);
  return {
    ...member,
    initials: initials,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name.replace(/\s/g, '+'))}&background=random&initials=${initials}&_=${Date.now()}`
  };
});

const MOCK_IT_SUPPORT_MEMBERS = [
  { name: 'Carvalho Pedro', area: 'GS/OIS-LA' },
  { name: 'Ricardo Micael', area: 'GS/TET-LA' },
  { name: 'Jacober Diego', area: 'GS/TET2-LA' },
  { name: 'Alves Marlon', area: 'GS/TET2-LA' },
  { name: 'Paro Patrícia', area: 'C/ISP-LA' },
  { name: 'Vieira Brenda', area: 'GS/ORS2-LA' },
  { name: 'Miranda Renan', area: 'GS/BDO-LA' },
  { name: 'Pereira Naely', area: 'GS/BDO-LA' },
  { name: 'Ferreira Millena', area: 'GS/BDO-LA' },
].map(member => {
  const cleanedNameForAvatar = getCleanedName(member.name);
  const initials = getInitials(member.name);
  return {
    ...member,
    initials: initials,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanedNameForAvatar.replace(/\s/g, '+'))}&background=random&initials=${initials}&_=${Date.now()}` // Added cache-buster and initials param
  };
});

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

        {/* User Profile & Brand Endorsement */}
        <div className="flex items-center gap-6">
          {/* Bosch Logo */}
          <img 
            src="https://www.svgrepo.com/show/305888/bosch.svg" 
            alt="Bosch" 
            className="h-6 w-auto object-contain"
          />
          
          <div className="h-8 w-[1px] bg-gray-200"></div>

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
            </div>
          </div>
        </div>

        {/* Supergraphic Bottom Border - The Bosch Identity */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: THEME.colors.supergraphic }}></div>
      </header>

      {/* Main Container */}
      <div className="flex w-full pt-14 h-full z-10 relative">
        {/* Expandable Sidebar - Bosch Light Style */}
        <aside
          className={`${isSidebarOpen ? 'w-80' : 'w-20'} bg-white flex-col border-r border-gray-200 shadow-lg relative z-20 transition-all duration-300 ease-in-out hidden md:flex`}
        >
          {/* Background Pattern (Subtle) */}
          <div className="absolute inset-0 bg-dot-grid opacity-10 pointer-events-none"></div>

          {/* Toggle Handle - Prominent and Accessible */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute -right-3 top-8 w-6 h-6 bg-[#005691] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#004475] hover:scale-110 transition-all z-50 cursor-pointer"
            title={isSidebarOpen ? "Recolher menu" : "Expandir menu"}
          >
            <svg className={`w-3 h-3 transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="flex-1 flex flex-col gap-2 pt-8 px-4 relative z-10 overflow-y-auto custom-scrollbar">
            {/* Team Section */}
            {isSidebarOpen && (
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#005691] mb-4 pl-2 border-b border-gray-100 pb-2">Team (GS/OBR12-LA1)</h3>
            )}
            {MOCK_TEAM_MEMBERS.map((member, index) => (
              <div key={`team-${index}`} className={`flex items-center gap-3 p-2 rounded-sm transition-all duration-200 ${isSidebarOpen ? 'hover:bg-gray-50' : 'justify-center'}`}>
                <div className="relative flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-mono text-[10px] font-bold border border-gray-200 bg-gray-50 text-gray-600 overflow-hidden shadow-sm`}>
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{member.initials}</span>
                    )}
                  </div>
                </div>
                {isSidebarOpen && (
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-gray-800 leading-tight whitespace-normal">{member.name}</span>
                    <span className="text-[9px] font-mono text-gray-500 mt-0.5">{member.area}</span>
                  </div>
                )}
              </div>
            ))}

            {/* Divider */}
            {isSidebarOpen && <div className="h-px bg-gray-200 my-6 mx-4"></div>}

            {/* IT Support Section */}
            {isSidebarOpen && (
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#005691] mb-4 pl-2 border-b border-gray-100 pb-2">IT & Risk Support</h3>
            )}
            {MOCK_IT_SUPPORT_MEMBERS.map((member, index) => (
              <div key={`it-${index}`} className={`flex items-center gap-3 p-2 rounded-sm transition-all duration-200 ${isSidebarOpen ? 'hover:bg-gray-50' : 'justify-center'}`}>
                <div className="relative flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-mono text-[10px] font-bold border border-gray-200 bg-gray-50 text-gray-600 overflow-hidden shadow-sm`}>
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{member.initials}</span>
                    )}
                  </div>
                </div>
                {isSidebarOpen && (
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-gray-800 leading-tight whitespace-normal">{member.name}</span>
                    <span className="text-[9px] font-mono text-gray-500 mt-0.5">{member.area}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer Signature */}
          <div className={`py-6 relative z-10 flex flex-col items-center gap-2 border-t border-gray-200 mx-4 transition-all duration-300 ${!isSidebarOpen ? 'border-transparent opacity-0' : ''}`}>
            {isSidebarOpen && (
              <div className="text-center w-full">
                <div className="text-xs font-bold text-gray-800">GS/OBR12-LA1</div>
                <div className="text-[9px] text-gray-500 font-mono mt-1 uppercase tracking-wide">Operations Book to Report</div>
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
