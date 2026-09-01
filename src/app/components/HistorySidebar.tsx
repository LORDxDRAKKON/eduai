'use client';
import React, { useState, useEffect } from 'react';

import Icon from '@/components/ui/AppIcon';

interface HistoryItem {
  id: string;
  type: 'story' | 'worksheet' | 'problem' | 'video';
  subject: string;
  topic: string;
  grade: string;
  language: string;
  createdAt: string;
  saved: boolean;
}

const MOCK_HISTORY: HistoryItem[] = [
  { id: 'hist-001', type: 'story', subject: 'Biology', topic: 'Photosynthesis in C3 plants', grade: '9', language: 'English', createdAt: '2026-09-01T05:30:00', saved: true },
  { id: 'hist-002', type: 'problem', subject: 'Physics', topic: 'Projectile motion examples', grade: '9', language: 'Hindi', createdAt: '2026-08-31T18:00:00', saved: false },
  { id: 'hist-003', type: 'worksheet', subject: 'Mathematics', topic: 'Quadratic equations practice', grade: '9', language: 'English', createdAt: '2026-08-31T14:20:00', saved: true },
  { id: 'hist-004', type: 'video', subject: 'Chemistry', topic: 'Ionic and covalent bonding', grade: '9', language: 'Tamil', createdAt: '2026-08-30T10:00:00', saved: false },
  { id: 'hist-005', type: 'story', subject: 'History', topic: 'The Mughal Empire and its legacy', grade: '9', language: 'English', createdAt: '2026-08-29T16:45:00', saved: true },
  { id: 'hist-006', type: 'problem', subject: 'Mathematics', topic: 'Trigonometry identities', grade: '9', language: 'English', createdAt: '2026-08-28T11:30:00', saved: true },
  { id: 'hist-007', type: 'worksheet', subject: 'English', topic: 'Active and passive voice', grade: '9', language: 'English', createdAt: '2026-08-27T09:15:00', saved: false },
  { id: 'hist-008', type: 'story', subject: 'Geography', topic: 'Monsoon patterns in India', grade: '9', language: 'Marathi', createdAt: '2026-08-26T15:00:00', saved: false },
];

const TYPE_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  story: { color: 'bg-primary/10 text-primary', label: 'Story', icon: 'BookOpenIcon' },
  worksheet: { color: 'bg-accent/10 text-accent', label: 'Sheet', icon: 'ClipboardDocumentListIcon' },
  problem: { color: 'bg-teal-50 text-teal-700', label: 'Problem', icon: 'CalculatorIcon' },
  video: { color: 'bg-amber-50 text-amber-700', label: 'Video', icon: 'PlayCircleIcon' },
};

function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default function HistorySidebar() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'saved'>('all');

  useEffect(() => {
    // Backend integration point: load from localStorage or API
    setHistory(MOCK_HISTORY);
  }, []);

  const filtered = filter === 'saved' ? history.filter((h) => h.saved) : history;

  return (
    <div className="bg-card rounded-2xl border border-border h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-600 text-sm text-foreground">Recent History</h3>
          <span className="badge-grade bg-muted text-muted-foreground">{history.length}</span>
        </div>
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {(['all', 'saved'] as const).map((f) => (
            <button
              key={`filter-${f}`}
              onClick={() => setFilter(f)}
              className={`flex-1 text-xs font-600 py-1.5 rounded-lg transition-all ${
                filter === f ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              {f === 'all' ? 'All' : '⭐ Saved'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="ClockIcon" size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No history yet</p>
            <p className="text-xs text-muted-foreground mt-1">Generated content will appear here</p>
          </div>
        ) : (
          filtered.map((item) => {
            const tc = TYPE_CONFIG[item.type];
            return (
              <div
                key={item.id}
                className="history-item-hover rounded-xl p-3 cursor-pointer border border-transparent hover:border-border"
              >
                <div className="flex items-start gap-2.5">
                  <div className={`w-7 h-7 rounded-lg ${tc.color} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon name={tc.icon as Parameters<typeof Icon>[0]['name']} size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-600 text-foreground truncate">{item.topic}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="badge-grade bg-secondary text-secondary-foreground">
                        Gr.{item.grade}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">{item.subject}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(item.createdAt)}</span>
                      {item.saved && (
                        <Icon name="BookmarkSolidIcon" size={12} className="text-accent" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 border-t border-border">
        <button className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-600 py-2.5 rounded-xl hover:bg-primary/90 transition-colors btn-press cursor-default opacity-50" disabled>
          <span className="text-white text-sm">+</span>
          New Generation
        </button>
      </div>
    </div>
  );
}