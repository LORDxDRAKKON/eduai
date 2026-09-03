'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
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

interface AppLayoutProps {
  children: React.ReactNode;
  activeRoute?: string;
  onNewLesson?: () => void;
  onNavigate?: (view: ActiveView) => void;
  history?: HistoryItem[];
  onOpenSettings?: () => void;
  onOpenProfile?: () => void;
}

export default function AppLayout({ children, activeRoute, onNewLesson, onNavigate, history, onOpenSettings, onOpenProfile }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background font-sans overflow-hidden">
      <Sidebar
        activeRoute={activeRoute}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewLesson={onNewLesson}
        onNavigate={onNavigate}
        history={history}
        onOpenSettings={onOpenSettings}
        onOpenProfile={onOpenProfile}
      />
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/30 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="flex-1 flex flex-col h-full w-full relative overflow-hidden min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} onOpenProfile={onOpenProfile} onOpenSettings={onOpenSettings} />
        <div className="flex-1 overflow-hidden bg-background">
          {children}
        </div>
      </div>
    </div>
  );
}