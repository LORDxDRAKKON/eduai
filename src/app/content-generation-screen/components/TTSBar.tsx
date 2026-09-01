'use client';
import React, { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { GeneratedContent } from './types';

const LANGUAGES = [
  { code: 'en-IN', label: 'English' },
  { code: 'hi-IN', label: 'हिन्दी' },
  { code: 'ta-IN', label: 'தமிழ்' },
  { code: 'te-IN', label: 'తెలుగు' },
  { code: 'bn-IN', label: 'বাংলা' },
  { code: 'mr-IN', label: 'मराठी' },
];

const SPEEDS = [
  { value: 0.75, label: '0.75x' },
  { value: 1, label: '1x' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
];

interface TTSBarProps {
  content: GeneratedContent;
}

export default function TTSBar({ content }: TTSBarProps) {
  const [playing, setPlaying] = useState(false);
  const [lang, setLang] = useState('en-IN');
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fullText = [
    content.title,
    content.summary,
    ...content.sections.map((s) => `${s.heading}. ${s.body}`),
  ].join('. ');

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handlePlay = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      setProgress(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    // Backend integration point: use translate-content edge function for non-English languages
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = lang;
    utterance.rate = speed;
    utterance.onend = () => {
      setPlaying(false);
      setProgress(100);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    utteranceRef.current = utterance;

    window.speechSynthesis.speak(utterance);
    setPlaying(true);
    setProgress(0);

    let elapsed = 0;
    const estimated = (fullText.length / 15) * (1 / speed) * 1000;
    intervalRef.current = setInterval(() => {
      elapsed += 200;
      setProgress(Math.min((elapsed / estimated) * 100, 99));
    }, 200);
  };

  return (
    <div className="tts-bar px-4 py-2.5 flex items-center gap-3">
      <button
        onClick={handlePlay}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all btn-press ${
          playing ? 'gradient-indigo text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'
        }`}
        aria-label={playing ? 'Stop reading' : 'Read aloud'}
      >
        <Icon name={playing ? 'StopIcon' : 'SpeakerWaveIcon'} size={18} />
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-600 text-secondary-foreground mb-1">
          {playing ? 'Reading aloud...' : 'Listen to this content'}
        </p>
        <div className="w-full h-1.5 bg-primary/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="text-xs bg-transparent border border-primary/30 rounded-lg px-2 py-1 text-secondary-foreground focus:outline-none focus:border-primary"
        >
          {LANGUAGES.map((l) => (
            <option key={`tts-lang-${l.code}`} value={l.code}>{l.label}</option>
          ))}
        </select>
        <select
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="text-xs bg-transparent border border-primary/30 rounded-lg px-2 py-1 text-secondary-foreground focus:outline-none focus:border-primary"
        >
          {SPEEDS.map((s) => (
            <option key={`tts-speed-${s.value}`} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}