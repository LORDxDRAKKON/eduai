'use client';

import React from 'react';

interface TopbarProps {
  onMenuClick?: () => void;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
}

export default function Topbar({ onMenuClick, onOpenProfile, onOpenSettings }: TopbarProps) {
  return (
    <div className="h-14 md:h-16 bg-card border-b border-border flex items-center justify-between px-3 md:px-6 lg:px-8 shrink-0">
      <div className="flex items-center gap-2">
        {/* Hamburger — visible on mobile & tablet (below lg) */}
        <button
          className="lg:hidden p-2 text-muted-foreground rounded-lg hover:bg-muted active:bg-muted/80 transition"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>
        <span className="font-bold text-foreground text-sm lg:hidden">EDU AI</span>
      </div>
      <div className="flex items-center gap-1 md:gap-3">
        <button
          onClick={onOpenSettings}
          className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition"
          title="Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
        <button className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition relative" title="Notifications">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full border-2 border-card" />
        </button>
        <button
          onClick={onOpenProfile}
          className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-xs cursor-pointer hover:opacity-90 transition active:scale-95"
          style={{ background: 'linear-gradient(to top right, hsl(234 89% 59%), hsl(271 91% 65%))' }}
          title="My Profile"
        >
          S
        </button>
      </div>
    </div>
  );
}