'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { VideoScene } from './types';

interface VideoPlayerProps {
  scenes: VideoScene[];
}

export default function VideoPlayer({ scenes }: VideoPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [narrating, setNarrating] = useState(false);

  const current = scenes[currentIndex];

  const goTo = (idx: number) => {
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
    setNarrating(false);
    setPlaying(false);
    setCurrentIndex(idx);
  };

  const goNext = () => {
    if (currentIndex < scenes.length - 1) goTo(currentIndex + 1);
  };

  const goPrev = () => {
    if (currentIndex > 0) goTo(currentIndex - 1);
  };

  const handleNarrate = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    if (narrating) {
      window.speechSynthesis.cancel();
      setNarrating(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(current.narration);
    utterance.lang = 'en-IN';
    utterance.rate = 0.9;
    utterance.onend = () => setNarrating(false);
    window.speechSynthesis.speak(utterance);
    setNarrating(true);
  };

  const handlePlayAll = () => {
    setPlaying(!playing);
    if (!playing) goTo(0);
  };

  return (
    <div className="space-y-4">
      {/* Main scene display */}
      <div className="relative bg-foreground/5 rounded-2xl overflow-hidden aspect-video flex items-center justify-center border border-border">
        {/* Scene illustration placeholder — Backend integration: show AI-generated scene image here */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl gradient-amber flex items-center justify-center mb-4">
            <Icon name="FilmIcon" size={28} className="text-white" />
          </div>
          <p className="text-sm font-600 text-foreground mb-1">{current.title}</p>
          <p className="text-xs text-muted-foreground max-w-sm">{current.description}</p>
          <p className="text-xs text-muted-foreground/60 mt-2 italic">
            AI image: {current.imagePrompt.slice(0, 80)}...
          </p>
        </div>

        {/* Scene counter */}
        <div className="absolute top-3 right-3 bg-foreground/70 text-background text-xs font-600 px-2.5 py-1 rounded-lg">
          {currentIndex + 1} / {scenes.length}
        </div>

        {/* Play/pause overlay */}
        <button
          onClick={handlePlayAll}
          className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-foreground/10"
        >
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <Icon name={playing ? 'PauseIcon' : 'PlayIcon'} size={24} className="text-foreground" />
          </div>
        </button>
      </div>

      {/* Narration */}
      <div className="bg-secondary rounded-xl p-4 border border-primary/20">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-xs font-600 text-secondary-foreground mb-1.5">Narration</p>
            <p className="text-sm text-foreground leading-relaxed">{current.narration}</p>
          </div>
          <button
            onClick={handleNarrate}
            className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all btn-press ${
              narrating ? 'gradient-indigo text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'
            }`}
            aria-label={narrating ? 'Stop narration' : 'Play narration'}
          >
            <Icon name={narrating ? 'StopIcon' : 'SpeakerWaveIcon'} size={16} />
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-600 text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Icon name="ChevronLeftIcon" size={16} />
          Previous
        </button>

        {/* Scene dots */}
        <div className="flex items-center gap-1.5">
          {scenes.map((_, i) => (
            <button
              key={`dot-${i}`}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all btn-press ${
                i === currentIndex ? 'w-4 h-2 bg-primary' : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/60'
              }`}
              aria-label={`Go to scene ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          disabled={currentIndex === scenes.length - 1}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-600 text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <Icon name="ChevronRightIcon" size={16} />
        </button>
      </div>

      {/* Scene thumbnails */}
      <div className="grid grid-cols-5 gap-2">
        {scenes.map((scene, i) => (
          <button
            key={scene.id}
            onClick={() => goTo(i)}
            className={`aspect-video rounded-xl overflow-hidden border-2 transition-all btn-press flex items-center justify-center text-xs font-600 ${
              i === currentIndex
                ? 'border-primary bg-primary/10 text-primary' :'border-border bg-muted text-muted-foreground hover:border-primary/40'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}