'use client';
import React from 'react';
import Icon from '@/components/ui/AppIcon';

const STATS = [
  {
    id: 'stat-generated',
    label: 'Generated Today',
    value: '7',
    unit: 'items',
    icon: 'DocumentTextIcon',
    trend: '+3 vs yesterday',
    positive: true,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    id: 'stat-streak',
    label: 'Learning Streak',
    value: '14',
    unit: 'days',
    icon: 'FireIcon',
    trend: 'Personal best!',
    positive: true,
    color: 'text-accent',
    bg: 'bg-accent/10',
  },
  {
    id: 'stat-subjects',
    label: 'Subjects This Week',
    value: '4',
    unit: 'subjects',
    icon: 'AcademicCapIcon',
    trend: 'Physics, Chem, Bio, Math',
    positive: true,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
  {
    id: 'stat-saved',
    label: 'Saved Content',
    value: '38',
    unit: 'items',
    icon: 'BookmarkIcon',
    trend: '5 due for review',
    positive: false,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
];

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {STATS.map((stat) => (
        <div
          key={stat.id}
          className="bg-card rounded-2xl border border-border p-4 card-hover"
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
              <Icon
                name={stat.icon as Parameters<typeof Icon>[0]['name']}
                size={18}
                className={stat.color}
              />
            </div>
          </div>
          <p className="text-2xl font-700 font-tabular text-foreground">
            {stat.value}
            <span className="text-sm font-500 text-muted-foreground ml-1">{stat.unit}</span>
          </p>
          <p className="text-xs font-500 text-muted-foreground mt-0.5">{stat.label}</p>
          <p className={`text-xs mt-1.5 font-500 ${stat.positive ? 'text-emerald-600' : 'text-amber-600'}`}>
            {stat.trend}
          </p>
        </div>
      ))}
    </div>
  );
}