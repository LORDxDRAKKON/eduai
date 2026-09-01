'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Icon from '@/components/ui/AppIcon';
import { ContentConfig, ContentType } from './types';

const CONTENT_TYPES: { id: ContentType; label: string; icon: string; color: string }[] = [
  { id: 'story', label: 'Story', icon: 'BookOpenIcon', color: 'content-type-story' },
  { id: 'worksheet', label: 'Worksheet', icon: 'ClipboardDocumentListIcon', color: 'content-type-worksheet' },
  { id: 'problem', label: 'Problem Set', icon: 'CalculatorIcon', color: 'content-type-problem' },
  { id: 'video', label: 'Video Lesson', icon: 'PlayCircleIcon', color: 'content-type-video' },
];

const GRADES_1_10 = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const GRADES_11_12 = ['11', '12'];

const SUBJECTS_BY_GRADE: Record<string, string[]> = {
  '1': ['English', 'Mathematics', 'Environmental Studies', 'Hindi'],
  '2': ['English', 'Mathematics', 'Environmental Studies', 'Hindi'],
  '3': ['English', 'Mathematics', 'Environmental Studies', 'Hindi', 'Science'],
  '4': ['English', 'Mathematics', 'Environmental Studies', 'Hindi', 'Science', 'Social Studies'],
  '5': ['English', 'Mathematics', 'Science', 'Social Studies', 'Hindi'],
  '6': ['English', 'Mathematics', 'Science', 'Social Studies', 'Hindi', 'Sanskrit'],
  '7': ['English', 'Mathematics', 'Science', 'Social Studies', 'Hindi', 'Sanskrit'],
  '8': ['English', 'Mathematics', 'Science', 'Social Studies', 'Hindi', 'Sanskrit'],
  '9': ['English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Economics', 'Hindi'],
  '10': ['English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Economics', 'Hindi'],
  '11-science': ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'English', 'Physical Education'],
  '11-commerce': ['Accountancy', 'Business Studies', 'Economics', 'Mathematics', 'English', 'Entrepreneurship'],
  '11-arts': ['History', 'Geography', 'Political Science', 'Economics', 'Sociology', 'Psychology', 'English', 'Hindi'],
  '12-science': ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'English', 'Physical Education'],
  '12-commerce': ['Accountancy', 'Business Studies', 'Economics', 'Mathematics', 'English', 'Entrepreneurship'],
  '12-arts': ['History', 'Geography', 'Political Science', 'Economics', 'Sociology', 'Psychology', 'English', 'Hindi'],
};

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
];

interface ConfigPanelProps {
  onGenerate: (config: ContentConfig) => void;
  isGenerating: boolean;
}

interface FormValues {
  topic: string;
}

export default function ConfigPanel({ onGenerate, isGenerating }: ConfigPanelProps) {
  const [contentType, setContentType] = useState<ContentType>('story');
  const [grade, setGrade] = useState('9');
  const [stream, setStream] = useState('science');
  const [subject, setSubject] = useState('Physics');
  const [language, setLanguage] = useState('en');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<unknown>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>();

  const topic = watch('topic', '');

  const isHighSchool = GRADES_11_12.includes(grade);
  const subjectKey = isHighSchool ? `${grade}-${stream}` : grade;
  const subjects = SUBJECTS_BY_GRADE[subjectKey] ?? SUBJECTS_BY_GRADE['9'];

  useEffect(() => {
    if (!subjects.includes(subject)) {
      setSubject(subjects[0]);
    }
  }, [grade, stream, subjects, subject]);

  const startListening = () => {
    // Backend integration point: Web Speech API voice input
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new (SpeechRecognition as new () => {
      lang: string;
      continuous: boolean;
      onresult: (e: { results: { transcript: string }[][] }) => void;
      onend: () => void;
      start: () => void;
      stop: () => void;
    })();
    recognition.lang = language === 'hi' ? 'hi-IN' : language === 'ta' ? 'ta-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setValue('topic', transcript);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      (recognitionRef.current as { stop: () => void }).stop();
    }
    setIsListening(false);
  };

  const onSubmit = (data: FormValues) => {
    onGenerate({
      type: contentType,
      grade,
      stream,
      subject,
      topic: data.topic,
      language,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-card rounded-2xl border border-border p-5 space-y-5 sticky top-24">
      <div>
        <h2 className="font-600 text-sm text-foreground mb-3">Content Type</h2>
        <div className="grid grid-cols-2 gap-2">
          {CONTENT_TYPES.map((ct) => (
            <button
              key={`ct-${ct.id}`}
              type="button"
              onClick={() => setContentType(ct.id)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all btn-press text-center ${
                contentType === ct.id
                  ? 'border-primary bg-primary/5' :'border-border hover:border-primary/40 hover:bg-muted'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg ${ct.color} flex items-center justify-center`}>
                <Icon name={ct.icon as Parameters<typeof Icon>[0]['name']} size={16} className="text-white" />
              </div>
              <span className={`text-xs font-600 ${contentType === ct.id ? 'text-primary' : 'text-foreground'}`}>
                {ct.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grade */}
      <div>
        <label className="block text-sm font-600 text-foreground mb-1.5">Grade</label>
        <div className="flex flex-wrap gap-1.5">
          {[...GRADES_1_10, ...GRADES_11_12].map((g) => (
            <button
              key={`grade-${g}`}
              type="button"
              onClick={() => setGrade(g)}
              className={`px-2.5 py-1 rounded-lg text-xs font-600 border transition-all btn-press ${
                grade === g
                  ? 'bg-primary text-white border-primary' :'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Stream (only for 11-12) */}
      {isHighSchool && (
        <div className="fade-in">
          <label className="block text-sm font-600 text-foreground mb-1.5">Stream</label>
          <div className="flex gap-2">
            {(['science', 'commerce', 'arts'] as const).map((s) => (
              <button
                key={`stream-${s}`}
                type="button"
                onClick={() => setStream(s)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-600 border transition-all btn-press capitalize ${
                  stream === s
                    ? 'bg-primary text-white border-primary' :'border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Subject */}
      <div>
        <label className="block text-sm font-600 text-foreground mb-1.5">Subject</label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-muted border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        >
          {subjects.map((s) => (
            <option key={`subj-${s}`} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Topic with voice input */}
      <div>
        <label className="block text-sm font-600 text-foreground mb-1">Topic / Chapter</label>
        <p className="text-xs text-muted-foreground mb-2">
          Enter a specific topic, chapter name, or concept to generate content about
        </p>
        <div className="relative">
          <textarea
            {...register('topic', {
              required: 'Please enter a topic to generate content about',
              minLength: { value: 3, message: 'Topic must be at least 3 characters' },
            })}
            rows={3}
            placeholder="e.g. Laws of motion, The French Revolution, Quadratic formula..."
            className="w-full px-3 py-2.5 pr-12 text-sm bg-muted border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
          />
          <button
            type="button"
            onMouseDown={startListening}
            onMouseUp={stopListening}
            onTouchStart={startListening}
            onTouchEnd={stopListening}
            className={`absolute bottom-2.5 right-2.5 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              isListening
                ? 'bg-accent text-white mic-pulse' :'bg-muted-foreground/10 text-muted-foreground hover:bg-accent/10 hover:text-accent'
            }`}
            aria-label={isListening ? 'Listening...' : 'Voice input'}
            title="Hold to speak your topic"
          >
            <Icon name="MicrophoneIcon" size={16} />
          </button>
        </div>
        {isListening && (
          <p className="text-xs text-accent font-500 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-accent mic-pulse inline-block" />
            Listening... release when done
          </p>
        )}
        {errors.topic && (
          <p className="text-xs text-red-600 mt-1">{errors.topic.message}</p>
        )}
      </div>

      {/* Language */}
      <div>
        <label className="block text-sm font-600 text-foreground mb-1.5">Output Language</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-muted border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        >
          {LANGUAGES.map((l) => (
            <option key={`lang-${l.code}`} value={l.code}>{l.label}</option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground mt-1">Content will be generated in this language</p>
      </div>

      {/* Generate button */}
      <button
        type="submit"
        disabled={isGenerating}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-600 text-sm transition-all btn-press ${
          isGenerating
            ? 'bg-primary/60 text-white cursor-not-allowed' :'gradient-indigo text-white hover:opacity-90 shadow-sm'
        }`}
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Generating with AI...</span>
          </>
        ) : (
          <>
            <Icon name="SparklesIcon" size={16} className="text-white" />
            <span>Generate Content</span>
          </>
        )}
      </button>

      {topic.length > 0 && !isGenerating && (
        <div className="bg-secondary rounded-xl p-3 border border-primary/20">
          <p className="text-xs text-secondary-foreground font-500">
            Will generate: <span className="font-700">{contentType}</span> for Grade {grade}
            {isHighSchool ? ` (${stream})` : ''} · {subject}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">Topic: {topic}</p>
        </div>
      )}
    </form>
  );
}