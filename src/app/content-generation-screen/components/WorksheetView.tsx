'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { ContentSection, WorksheetQuestion } from './types';

interface WorksheetViewProps {
  sections: ContentSection[];
  questions: WorksheetQuestion[];
}

export default function WorksheetView({ sections, questions }: WorksheetViewProps) {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<Record<string, string>>({});

  const toggleReveal = (id: string) => {
    setRevealed((p) => ({ ...p, [id]: !p[id] }));
  };

  return (
    <div className="space-y-6">
      {sections.map((s) => (
        <div key={`ws-section-${s.heading}`} className="bg-secondary rounded-xl p-4">
          <h3 className="font-700 text-sm text-foreground mb-1">{s.heading}</h3>
          <p className="text-xs text-muted-foreground">{s.body}</p>
        </div>
      ))}

      <div className="space-y-4">
        {questions.map((q) => (
          <div key={q.id} className="border border-border rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-700 flex items-center justify-center shrink-0">
                {q.number}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-500 text-foreground mb-3">{q.question}</p>

                {q.type === 'mcq' && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    {q.options.map((opt) => (
                      <button
                        key={`${q.id}-opt-${opt}`}
                        onClick={() => setSelected((p) => ({ ...p, [q.id]: opt }))}
                        className={`text-left px-3 py-2 text-sm rounded-xl border transition-all btn-press ${
                          selected[q.id] === opt
                            ? revealed[q.id]
                              ? opt === q.answer
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-600' :'border-red-400 bg-red-50 text-red-700' :'border-primary bg-primary/5 text-primary font-500' :'border-border hover:border-primary/50 text-foreground'
                        }`}
                      >
                        {opt}
                        {revealed[q.id] && opt === q.answer && (
                          <Icon name="CheckCircleIcon" size={14} className="inline ml-1.5 text-emerald-600" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {q.type !== 'mcq' && (
                  <textarea
                    rows={q.type === 'long' ? 4 : 2}
                    placeholder="Write your answer here..."
                    className="w-full px-3 py-2 text-sm bg-muted border border-border rounded-xl focus:border-primary focus:outline-none resize-none mb-3 transition-all"
                  />
                )}

                <div className="flex items-center gap-3">
                  {q.hint && !revealed[q.id] && (
                    <button
                      onClick={() => {}}
                      className="text-xs text-accent font-500 flex items-center gap-1 hover:underline"
                    >
                      <Icon name="LightBulbIcon" size={13} className="text-accent" />
                      Hint
                    </button>
                  )}
                  {q.answer && (
                    <button
                      onClick={() => toggleReveal(q.id)}
                      className="text-xs text-primary font-500 flex items-center gap-1 hover:underline"
                    >
                      <Icon name={revealed[q.id] ? 'EyeSlashIcon' : 'EyeIcon'} size={13} className="text-primary" />
                      {revealed[q.id] ? 'Hide answer' : 'Show answer'}
                    </button>
                  )}
                </div>

                {revealed[q.id] && q.answer && (
                  <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 fade-in">
                    <p className="text-xs font-600 text-emerald-700">Answer: {q.answer}</p>
                    {q.hint && <p className="text-xs text-emerald-600 mt-0.5">Hint: {q.hint}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}