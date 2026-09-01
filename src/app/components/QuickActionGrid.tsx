'use client';
import React from 'react';
import Icon from '@/components/ui/AppIcon';

const ACTIONS = [
  {
    id: 'action-story',
    type: 'story',
    label: 'Stories',
    description: 'Concept-based narratives that make learning stick',
    icon: 'BookOpenIcon',
    gradient: 'content-type-story',
    examples: ['Photosynthesis story', 'French Revolution tale', 'Algebra adventure'],
    count: 24,
  },
  {
    id: 'action-worksheet',
    type: 'worksheet',
    label: 'Worksheets',
    description: 'Practice questions with hints and explanations',
    icon: 'ClipboardDocumentListIcon',
    gradient: 'content-type-worksheet',
    examples: ['Quadratic equations', 'Chemical bonding', 'Grammar exercises'],
    count: 18,
  },
  {
    id: 'action-problem',
    type: 'problem',
    label: 'Problem Solving',
    description: 'Step-by-step worked examples and practice sets',
    icon: 'CalculatorIcon',
    gradient: 'content-type-problem',
    examples: ['Kinematics problems', 'Organic reactions', 'Probability sets'],
    count: 31,
  },
  {
    id: 'action-video',
    type: 'video',
    label: 'Video Lessons',
    description: 'Scene-by-scene visual lessons with narration',
    icon: 'PlayCircleIcon',
    gradient: 'content-type-video',
    examples: ['Cell division', 'Projectile motion', 'Mughal Empire'],
    count: 9,
  },
];

export default function QuickActionGrid() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-600 text-foreground">Generate Content</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {ACTIONS.map((action) => (
          <div key={action.id} className="group bg-card rounded-2xl border border-border overflow-hidden h-full opacity-60 cursor-not-allowed">
            {/* Header */}
            <div className={`${action.gradient} p-5 relative overflow-hidden`}>
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
              <Icon
                name={action.icon as Parameters<typeof Icon>[0]['name']}
                size={28}
                className="text-white relative z-10"
              />
              <div className="mt-3 flex items-end justify-between relative z-10">
                <h3 className="text-white font-700 text-base">{action.label}</h3>
                <span className="text-white/70 text-xs font-500">{action.count} saved</span>
              </div>
            </div>
            {/* Body */}
            <div className="p-4">
              <p className="text-sm text-muted-foreground mb-3">{action.description}</p>
              <div className="space-y-1">
                {action.examples.map((ex) => (
                  <div
                    key={`${action.id}-ex-${ex}`}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                    {ex}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}