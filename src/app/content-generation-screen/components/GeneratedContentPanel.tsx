'use client';
import React, { useState } from 'react';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';
import { GeneratedContent } from './types';
import TTSBar from './TTSBar';
import VideoPlayer from './VideoPlayer';
import WorksheetView from './WorksheetView';

interface Props {
  content: GeneratedContent;
  onRegenerate: () => void;
  onSave: () => void;
}

export default function GeneratedContentPanel({ content, onRegenerate, onSave }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = [
      content.title,
      content.summary,
      ...content.sections.map((s) => `${s.heading}\n${s.body}`),
    ].join('\n\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const TYPE_BADGE: Record<string, { label: string; color: string }> = {
    story: { label: 'Story', color: 'bg-primary/10 text-primary' },
    worksheet: { label: 'Worksheet', color: 'bg-accent/10 text-accent' },
    problem: { label: 'Problem Set', color: 'bg-teal-50 text-teal-700' },
    video: { label: 'Video Lesson', color: 'bg-amber-50 text-amber-700' },
  };

  const badge = TYPE_BADGE[content.type] ?? TYPE_BADGE.story;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden fade-in">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-border">
        <div className="flex flex-wrap items-start gap-2 mb-3">
          <span className={`badge-grade ${badge.color}`}>{badge.label}</span>
          <span className="badge-grade bg-secondary text-secondary-foreground">Grade {content.grade}</span>
          <span className="badge-grade bg-muted text-muted-foreground">{content.subject}</span>
          {content.language !== 'en' && (
            <span className="badge-grade bg-emerald-50 text-emerald-700">{content.language.toUpperCase()}</span>
          )}
        </div>
        <h2 className="text-xl font-700 text-foreground leading-snug mb-2">{content.title}</h2>
        <p className="text-sm text-muted-foreground">{content.summary}</p>
      </div>

      {/* TTS bar */}
      <div className="px-6 py-3 border-b border-border">
        <TTSBar content={content} />
      </div>

      {/* Content body */}
      <div className="px-6 py-5">
        {content.type === 'video' && content.scenes ? (
          <VideoPlayer scenes={content.scenes} />
        ) : content.type === 'worksheet' && content.questions ? (
          <WorksheetView sections={content.sections} questions={content.questions} />
        ) : (
          <div className="space-y-5">
            {content.sections.map((section) => (
              <div key={`section-${section.heading}`} className="border-l-2 border-primary/30 pl-4">
                <h3 className="font-600 text-base text-foreground mb-2">{section.heading}</h3>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{section.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 pb-6 pt-2 border-t border-border flex flex-wrap gap-3">
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-4 py-2.5 gradient-indigo text-white text-sm font-600 rounded-xl hover:opacity-90 transition-opacity btn-press"
        >
          <Icon name="BookmarkIcon" size={16} className="text-white" />
          Save to History
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2.5 bg-muted text-foreground text-sm font-600 rounded-xl hover:bg-border transition-colors btn-press"
        >
          <Icon name={copied ? 'CheckIcon' : 'ClipboardDocumentIcon'} size={16} className={copied ? 'text-emerald-600' : 'text-muted-foreground'} />
          {copied ? 'Copied!' : 'Copy Text'}
        </button>
        <button
          onClick={onRegenerate}
          className="flex items-center gap-2 px-4 py-2.5 bg-muted text-foreground text-sm font-600 rounded-xl hover:bg-border transition-colors btn-press"
        >
          <Icon name="ArrowPathIcon" size={16} className="text-muted-foreground" />
          Regenerate
        </button>
        <button
          onClick={() => toast.info('Share feature coming soon!')}
          className="flex items-center gap-2 px-4 py-2.5 bg-muted text-foreground text-sm font-600 rounded-xl hover:bg-border transition-colors btn-press"
        >
          <Icon name="ShareIcon" size={16} className="text-muted-foreground" />
          Share
        </button>
      </div>
    </div>
  );
}