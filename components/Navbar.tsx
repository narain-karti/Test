
import React from 'react';
import { LayoutDashboard, Camera, Activity, BarChart3, Settings, Bot, Sparkles } from 'lucide-react';

export type Tab = 'workout' | 'form' | 'activity' | 'progress' | 'lab' | 'settings';

interface NavbarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onBotClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onBotClick }) => {
  const tabs = [
    { id: 'workout' as const, icon: LayoutDashboard, label: 'Workouts' },
    { id: 'form' as const, icon: Camera, label: 'Form AI' },
    { id: 'lab' as const, icon: Sparkles, label: 'Lab' },
    { id: 'progress' as const, icon: BarChart3, label: 'Insights' },
    { id: 'settings' as const, icon: Settings, label: 'Config' },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 px-4 pb-4">
      <div className="max-w-md mx-auto glass-morphism rounded-[2.5rem] border-white/10 p-2 flex items-center justify-between shadow-2xl relative">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center gap-1 flex-1 py-3 transition-all duration-300 ${isActive ? 'text-cyan-400' : 'text-white/40'}`}
            >
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
              )}
              <Icon size={24} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
            </button>
          );
        })}
        
        {/* Floating Chat Button (Contextual) */}
        <button 
          onClick={onBotClick}
          className="absolute -top-16 right-2 w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_10px_30px_rgba(34,211,238,0.3)] hover:scale-110 active:scale-95 transition-all duration-300"
        >
          <Bot className="text-white w-7 h-7" />
        </button>
      </div>
    </div>
  );
};

export default Navbar;
