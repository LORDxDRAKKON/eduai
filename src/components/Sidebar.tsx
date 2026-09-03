'use client';

import React from 'react';
import type { ActiveView } from '@/app/page';

interface HistoryItem {
  id: string;
  title: string;
  topic: string;
  type: string;
  grade: string;
  subject: string;
  savedAt: string;
}

interface SidebarProps {
  activeRoute?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onNavigate?: (view: ActiveView) => void;
  onNewLesson?: () => void;
  history?: HistoryItem[];
  onOpenSettings?: () => void;
  onOpenProfile?: () => void;
}

export default function Sidebar({ activeRoute, isOpen, onClose, onNavigate, onNewLesson, history = [], onOpenSettings, onOpenProfile }: SidebarProps) {
  const handleNav = (view: ActiveView) => {
    if (onNavigate) onNavigate(view);
    if (onClose) onClose();
  };

  const handleNewLesson = () => {
    if (onNewLesson) onNewLesson();
    if (onClose) onClose();
  };

  const navItems: { view: ActiveView; icon: React.ReactNode; label: string }[] = [
    {
      view: 'ai-tutor',
      label: 'AI Tutor',
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-3 flex-shrink-0"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg>,
    },
    {
      view: 'code-playground',
      label: 'Code Playground',
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-3 flex-shrink-0"><path d="m18 16 4-4-4-4" /><path d="m6 8-4 4 4 4" /><path d="m14.5 4-5 16" /></svg>,
    },
    {
      view: 'flashcards',
      label: 'Flashcards',
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-3 flex-shrink-0"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" /><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" /><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" /></svg>,
    },
    {
      view: 'quiz',
      label: 'Quiz Player',
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-3 flex-shrink-0"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>,
    },
    {
      view: 'daily-challenges',
      label: 'Daily Challenges',
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-3 flex-shrink-0"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>,
    },
  ];

  return (
    <div
      className={`fixed inset-y-0 left-0 z-30 w-72 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-white">
            <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
          </svg>
        </div>
        <span className="font-bold text-lg text-foreground tracking-tight">EDU AI</span>
        {/* Close button for mobile/tablet */}
        <button
          onClick={onClose}
          className="ml-auto p-1.5 rounded-lg text-muted-foreground hover:bg-muted lg:hidden"
          aria-label="Close sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* New Lesson Button */}
      <div className="p-4">
        <button
          onClick={handleNewLesson}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-semibold text-sm bg-primary text-white hover:bg-primary/90 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M5 12h14" /><path d="M12 5v14" />
          </svg>
          New Lesson
        </button>
      </div>

      {/* Skill Tools */}
      <div className="px-3 py-2">
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-3">Skill Tools</div>
        {navItems.map(item => (
          <SidebarButton
            key={item.view}
            icon={item.icon}
            label={item.label}
            active={activeRoute === item.view}
            onClick={() => handleNav(item.view)}
          />
        ))}
      </div>

      {/* Recent Lessons */}
      <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin">
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-3">Recent Lessons</div>
        {history.length === 0 ? (
          <div className="text-center py-4 px-4 text-muted-foreground text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 mx-auto mb-2 opacity-30">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" />
            </svg>
            No history yet.
          </div>
        ) : (
          <div className="space-y-1">
            {history.slice(0, 10).map(item => (
              <button
                key={item.id}
                onClick={() => handleNav('dashboard')}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-muted transition group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">{item.type.slice(0, 3)}</span>
                  <span className="text-xs text-foreground truncate">{item.title || item.topic}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border bg-muted/50">
        <div className="flex items-center gap-2 mb-3 text-xs font-bold" style={{ color: 'hsl(142 71% 45%)' }}>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'hsl(142 71% 45%)' }} />
          Online
        </div>
        <SidebarButton
          icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-3 flex-shrink-0 text-muted-foreground group-hover:text-foreground"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
          label="My Profile"
          active={activeRoute === 'profile'}
          onClick={() => { if (onOpenProfile) onOpenProfile(); if (onClose) onClose(); }}
        />
        <SidebarButton
          icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-3 flex-shrink-0 text-muted-foreground group-hover:text-foreground"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>}
          label="Settings"
          onClick={() => { if (onOpenSettings) onOpenSettings(); if (onClose) onClose(); }}
        />
      </div>
    </div>
  );
}

interface SidebarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}

function SidebarButton({ icon, label, onClick, active }: SidebarButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 group text-left active:scale-95 ${
        active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
      }`}
    >
      {icon}
      <span className="block text-sm truncate font-medium">{label}</span>
    </button>
  );
}