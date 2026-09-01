import React from 'react';

export default function ContentSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
      {/* Header */}
      <div className="space-y-2">
        <div className="skeleton-pulse h-7 w-3/4 rounded-xl" />
        <div className="skeleton-pulse h-4 w-full rounded-lg" />
        <div className="skeleton-pulse h-4 w-5/6 rounded-lg" />
      </div>
      {/* TTS bar */}
      <div className="skeleton-pulse h-12 w-full rounded-xl" />
      {/* Sections */}
      {[1, 2, 3]?.map((i) => (
        <div key={`skel-section-${i}`} className="space-y-2 pt-2 border-t border-border">
          <div className="skeleton-pulse h-5 w-1/3 rounded-lg" />
          <div className="skeleton-pulse h-4 w-full rounded-lg" />
          <div className="skeleton-pulse h-4 w-full rounded-lg" />
          <div className="skeleton-pulse h-4 w-4/5 rounded-lg" />
        </div>
      ))}
      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <div className="skeleton-pulse h-10 w-32 rounded-xl" />
        <div className="skeleton-pulse h-10 w-24 rounded-xl" />
        <div className="skeleton-pulse h-10 w-28 rounded-xl" />
      </div>
    </div>
  );
}