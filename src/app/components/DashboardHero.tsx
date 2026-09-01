import React from 'react';

export default function DashboardHero() {
  return (
    <div className="relative overflow-hidden rounded-2xl gradient-indigo p-6 lg:p-8 text-white">
      <div className="blob-primary absolute -top-10 -right-10 w-64 h-64 opacity-30" />
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-indigo-200 text-sm font-500 mb-1">Good morning, Priya 👋</p>
          <h1 className="text-2xl lg:text-3xl font-700 leading-tight mb-2">
            Ready to learn something<br className="hidden sm:block" /> new today?
          </h1>
          <p className="text-indigo-200 text-sm">
            Grade 9 · Science Stream · 14-day streak 🔥
          </p>
        </div>
      </div>
    </div>
  );
}