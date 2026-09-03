'use client';

import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import { useChat } from '@/lib/hooks/useChat';
import toast from 'react-hot-toast';
import ProfileView from '@/app/profile-screen/components/ProfileView';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export type ActiveView =
  | 'dashboard' |'ai-tutor' |'code-playground' |'flashcards' |'quiz' |'daily-challenges' |'profile' |'new-lesson';

interface HistoryItem {
  id: string;
  title: string;
  topic: string;
  type: string;
  grade: string;
  subject: string;
  savedAt: string;
}

interface SettingsData {
  name: string;
  grade: string;
  language: string;
  notifications: boolean;
  darkMode: boolean;
}

export default function DashboardPage() {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const { userRole, loading: authLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/sign-up-login-screen');
      return;
    }
    if (!authLoading && userRole === 'teacher') {
      router.replace('/teacher-dashboard');
    }
  }, [userRole, authLoading, user, router]);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false); // kept for legacy, profile now uses view
  const [settings, setSettings] = useState<SettingsData>({
    name: 'Student',
    grade: 'Grade 9',
    language: 'English',
    notifications: true,
    darkMode: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem('eduai-history');
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch {}
    }
    const savedSettings = localStorage.getItem('eduai-settings');
    if (savedSettings) {
      try { setSettings(JSON.parse(savedSettings)); } catch {}
    }
  }, []);

  const handleNavigate = (view: ActiveView) => {
    setActiveView(view);
  };

  const handleSaveSettings = (s: SettingsData) => {
    setSettings(s);
    localStorage.setItem('eduai-settings', JSON.stringify(s));
    setShowSettings(false);
    toast.success('Settings saved!');
  };

  return (
    <>
      <AppLayout
        activeRoute={activeView}
        onNewLesson={() => setActiveView('new-lesson')}
        onNavigate={handleNavigate}
        history={history}
        onOpenSettings={() => setShowSettings(true)}
        onOpenProfile={() => setActiveView('profile')}
      >
        {activeView === 'dashboard' && (
          <DashboardView onActionClick={(type) => {
            if (type === 'AI Tutor') { setActiveView('ai-tutor'); return; }
            if (type === 'Code Playground') { setActiveView('code-playground'); return; }
            if (type === 'Flashcards') { setActiveView('flashcards'); return; }
            if (type === 'Daily Challenges') { setActiveView('daily-challenges'); return; }
            if (type === 'Quiz') { setActiveView('quiz'); return; }
          }} />
        )}
        {activeView === 'new-lesson' && (
          <NewLessonView onBack={() => setActiveView('dashboard')} />
        )}
        {activeView === 'ai-tutor' && (
          <AiTutorView onBack={() => setActiveView('dashboard')} />
        )}
        {activeView === 'code-playground' && (
          <CodePlaygroundView onBack={() => setActiveView('dashboard')} />
        )}
        {activeView === 'flashcards' && (
          <FlashcardsView onBack={() => setActiveView('dashboard')} />
        )}
        {activeView === 'quiz' && (
          <QuizView onBack={() => setActiveView('dashboard')} />
        )}
        {activeView === 'daily-challenges' && (
          <DailyChallengesView onBack={() => setActiveView('dashboard')} />
        )}
        {activeView === 'profile' && (
          <ProfileView onBack={() => setActiveView('dashboard')} history={history} />
        )}
      </AppLayout>

      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

function DashboardView({ onActionClick }: { onActionClick: (type: string) => void }) {
  const { user } = useAuth();
  const studentName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Alex';

  // Mock stats - in a real app these would come from the database
  const stats = {
    streak: 0,
    challenges: 0,
    flashcards: 0,
    xp: 0,
    level: 1,
    xpToNext: 100,
    totalXP: 0,
  };

  return (
    <div className="max-w-2xl mx-auto p-5 md:p-6 overflow-y-auto h-full bg-gray-50">
      {/* Greeting */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Hello, {studentName.charAt(0).toUpperCase() + studentName.slice(1)}! 👋</h1>
        <p className="text-sm text-emerald-600 mt-0.5">Track your progress and keep learning.</p>
      </div>

      {/* Level / XP Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
              {stats.level}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Level {stats.level}</p>
              <p className="text-xs text-gray-500">{stats.xpToNext} XP to next level</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-indigo-600">{stats.totalXP}</p>
            <p className="text-xs text-gray-500">Total XP</p>
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all"
            style={{ width: `${Math.min((stats.totalXP / (stats.xpToNext + stats.totalXP)) * 100, 100)}%` }}
          />
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          <div className="bg-orange-50 rounded-xl p-3 text-center border border-orange-100">
            <div className="text-xl mb-1">🔥</div>
            <p className="text-base font-bold text-gray-900">{stats.streak}d</p>
            <p className="text-xs text-gray-500">Streak</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
            <div className="text-xl mb-1">✅</div>
            <p className="text-base font-bold text-gray-900">{stats.challenges}</p>
            <p className="text-xs text-gray-500">Challenges</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-3 text-center border border-purple-100">
            <div className="text-xl mb-1">📚</div>
            <p className="text-base font-bold text-gray-900">{stats.flashcards}</p>
            <p className="text-xs text-gray-500">Flashcards</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-3 text-center border border-yellow-100">
            <div className="text-xl mb-1">⭐</div>
            <p className="text-base font-bold text-gray-900">{stats.xp}</p>
            <p className="text-xs text-gray-500">XP</p>
          </div>
        </div>
      </div>

      {/* Assigned Lessons Banner */}
      <button
        onClick={() => onActionClick('Assigned Lessons')}
        className="w-full mb-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between text-white shadow-md hover:shadow-lg transition-shadow"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <div className="text-left">
            <p className="font-bold text-sm">Assigned Lessons</p>
            <p className="text-xs text-white/80">Lessons from your teacher</p>
          </div>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>

      {/* LEARN Section */}
      <div className="mb-6">
        <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <span>🟢</span> LEARN
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <DashCard
            emoji="🤖"
            title="AI Tutor"
            titleColor="text-indigo-600"
            subtitle="Ask questions and get instant explanations"
            onClick={() => onActionClick('AI Tutor')}
          />
          <DashCard
            emoji="📇"
            title="Flashcards"
            titleColor="text-orange-500"
            subtitle="Study with spaced repetition"
            onClick={() => onActionClick('Flashcards')}
          />
          <DashCard
            emoji="💻"
            title="Code Playground"
            titleColor="text-teal-600"
            subtitle="Write and run code interactively"
            onClick={() => onActionClick('Code Playground')}
          />
          <DashCard
            emoji="🔥"
            title="Daily Challenges"
            titleColor="text-orange-500"
            subtitle="Practice problems and earn XP"
            onClick={() => onActionClick('Daily Challenges')}
          />
        </div>
      </div>

      {/* OFFLINE Section */}
      <div className="mb-4">
        <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <span>🟠</span> OFFLINE
        </h2>
        <button
          onClick={() => onActionClick('Offline Answers')}
          className="w-full bg-white rounded-2xl border border-gray-200 p-4 flex items-center justify-between hover:shadow-md transition-shadow shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div className="text-left">
              <p className="font-bold text-sm text-gray-900">Offline Answers</p>
              <p className="text-xs text-gray-500">Browse teacher-saved Q&As — works without internet</p>
            </div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

interface DashCardProps {
  emoji: string;
  title: string;
  titleColor: string;
  subtitle: string;
  onClick?: () => void;
}

function DashCard({ emoji, title, titleColor, subtitle, onClick }: DashCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-200 p-4 text-left hover:shadow-md transition-shadow shadow-sm flex flex-col gap-2"
    >
      <span className="text-2xl">{emoji}</span>
      <div>
        <p className={`font-bold text-sm ${titleColor}`}>{title}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{subtitle}</p>
      </div>
    </button>
  );
}

interface ActionCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  onClick?: () => void;
}

function ActionCard({ icon, iconBg, title, subtitle, onClick }: ActionCardProps) {
  return (
    <button onClick={onClick} className="p-5 rounded-2xl border border-border bg-card transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 text-left group">
      <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-3 border ${iconBg}`}>{icon}</div>
      <h3 className="font-bold text-card-foreground text-sm mb-0.5 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-xs text-muted-foreground font-medium">{subtitle}</p>
    </button>
  );
}

// ─── AI Tutor ─────────────────────────────────────────────────────────────────

const GRADES = ['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'];
const LANGUAGES = ['English','Hindi','Bengali','Telugu','Marathi','Tamil','Gujarati','Kannada','Malayalam','Punjabi'];
const SUBJECTS_MAP: Record<string, string[]> = {
  'Grade 1': ['English','Mathematics','Environmental Studies','Hindi'],
  'Grade 2': ['English','Mathematics','Environmental Studies','Hindi'],
  'Grade 3': ['English','Mathematics','Environmental Studies','Hindi','Science'],
  'Grade 4': ['English','Mathematics','Science','Social Studies','Hindi'],
  'Grade 5': ['English','Mathematics','Science','Social Studies','Hindi'],
  'Grade 6': ['English','Mathematics','Science','Social Studies','Hindi','Sanskrit'],
  'Grade 7': ['English','Mathematics','Science','Social Studies','Hindi','Sanskrit'],
  'Grade 8': ['English','Mathematics','Science','Social Studies','Hindi','Sanskrit'],
  'Grade 9': ['English','Mathematics','Physics','Chemistry','Biology','History','Geography','Economics','Hindi'],
  'Grade 10': ['English','Mathematics','Physics','Chemistry','Biology','History','Geography','Economics','Hindi'],
  'Grade 11 Science': ['Physics','Chemistry','Mathematics','Biology','Computer Science','English'],
  'Grade 11 Commerce': ['Accountancy','Business Studies','Economics','Mathematics','English'],
  'Grade 11 Arts': ['History','Geography','Political Science','Economics','Sociology','English'],
  'Grade 12 Science': ['Physics','Chemistry','Mathematics','Biology','Computer Science','English'],
  'Grade 12 Commerce': ['Accountancy','Business Studies','Economics','Mathematics','English'],
  'Grade 12 Arts': ['History','Geography','Political Science','Economics','Sociology','English'],
};
interface ChatMessage { role: 'user' | 'assistant'; content: string; }

function AiTutorView({ onBack }: { onBack: () => void }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { response, isLoading, error, sendMessage } = useChat('PERPLEXITY', 'perplexity/sonar-pro', true);

  useEffect(() => { if (error) toast.error(error.message); }, [error]);
  useEffect(() => {
    if (response) {
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') return [...prev.slice(0, -1), { role: 'assistant', content: response }];
        return [...prev, { role: 'assistant', content: response }];
      });
    }
  }, [response, isLoading]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    const userMsg: ChatMessage = { role: 'user', content: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    sendMessage([
      { role: 'system', content: 'You are EDU AI Tutor, a friendly educational assistant for Indian school students (Grade 1-12). Help students understand concepts clearly, solve problems step-by-step, and make learning fun. Be encouraging and use simple language. For math/science, show clear steps.' },
      ...updated.map(m => ({ role: m.role, content: m.content })),
    ], { temperature: 0.7, max_tokens: 1500 });
  };

  const suggested = ["Explain Newton\'s laws of motion", "How does photosynthesis work?", "Solve: 2x² + 5x - 3 = 0", "What caused World War I?"];

  return (
    <div className="flex flex-col h-full">
      <ViewHeader onBack={onBack} icon={<BotIcon />} title="AI Tutor" subtitle="Ask me anything about your studies" />
      <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 md:gap-6 text-center px-2">
            <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <BotIcon className="w-6 h-6 md:w-7 md:h-7 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base md:text-lg mb-1">Hi! I'm your AI Tutor</h3>
              <p className="text-muted-foreground text-sm max-w-sm">Ask me any question about your studies — I'll explain concepts, solve problems, and help you learn!</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
              {suggested.map(q => (
                <button key={q} onClick={() => setInput(q)} className="text-left px-3 py-2.5 md:px-4 md:py-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition text-sm text-foreground">{q}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mr-2 mt-1 shrink-0"><BotIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" /></div>}
            <div className={`max-w-[85%] md:max-w-[75%] px-3 py-2.5 md:px-4 md:py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-primary text-white rounded-br-sm' : 'bg-card border border-border text-foreground rounded-bl-sm'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start">
            <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mr-2 mt-1 shrink-0"><BotIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" /></div>
            <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0,150,300].map(d => <span key={d} className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 md:p-4 border-t border-border bg-card shrink-0">
        <div className="flex items-end gap-2 md:gap-3 max-w-3xl mx-auto">
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask your tutor anything..." rows={1}
            className="flex-1 px-3 py-2.5 md:px-4 md:py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm resize-none"
            style={{ minHeight: '44px', maxHeight: '120px' }} />
          <button onClick={handleSend} disabled={!input.trim() || isLoading}
            className="h-11 w-11 md:h-12 md:w-12 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition shrink-0 active:scale-95">
            {isLoading ? <SpinIcon className="h-4 w-4" /> : <SendIcon />}
          </button>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2 hidden sm:block">Powered by Perplexity · Press Enter to send</p>
      </div>
    </div>
  );
}

// ─── Code Playground ──────────────────────────────────────────────────────────

function CodePlaygroundView({ onBack }: { onBack: () => void }) {
  const [code, setCode] = useState('# Write your Python code here\nprint("Hello, World!")\n\n# Example: Calculate factorial\ndef factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n-1)\n\nprint(factorial(5))');
  const [language, setLanguage] = useState('Python');
  const [review, setReview] = useState('');
  const { response, isLoading, error, sendMessage } = useChat('PERPLEXITY', 'perplexity/sonar-pro', false);

  useEffect(() => { if (error) toast.error(error.message); }, [error]);
  useEffect(() => { if (response && !isLoading) setReview(response); }, [response, isLoading]);

  const handleReview = () => {
    setReview('');
    sendMessage([
      { role: 'system', content: 'You are an expert programming tutor for school students. Review the code, explain what it does, identify any bugs or improvements, and provide educational feedback. Be encouraging and clear.' },
      { role: 'user', content: `Please review this ${language} code and provide educational feedback:\n\n\`\`\`${language.toLowerCase()}\n${code}\n\`\`\`` },
    ], { temperature: 0.5, max_tokens: 1500 });
  };

  return (
    <div className="flex flex-col h-full">
      <ViewHeader onBack={onBack} icon={<CodeIcon />} title="Code Playground" subtitle="Write code and get AI review" />
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-0">
        {/* Editor */}
        <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-border" style={{ minHeight: '200px' }}>
          <div className="flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 border-b border-border bg-card">
            <div className="flex items-center gap-3">
              <select value={language} onChange={e => setLanguage(e.target.value)}
                className="text-sm border border-border rounded-lg px-2.5 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                {['Python','JavaScript','Java','C++','HTML'].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <button onClick={handleReview} disabled={isLoading || !code.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-primary text-white text-xs md:text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition active:scale-95">
              {isLoading ? <><SpinIcon />Reviewing...</> : <><SparkleIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />AI Review</>}
            </button>
          </div>
          <textarea value={code} onChange={e => setCode(e.target.value)}
            className="flex-1 p-3 md:p-4 font-mono text-sm bg-gray-950 text-green-400 resize-none focus:outline-none"
            style={{ minHeight: '180px' }}
            spellCheck={false} placeholder="Write your code here..." />
        </div>
        {/* Review */}
        <div className="w-full lg:w-96 flex flex-col bg-card" style={{ maxHeight: '40vh', minHeight: '120px' }}>
          <div className="px-3 md:px-4 py-2.5 md:py-3 border-b border-border">
            <h3 className="font-semibold text-sm text-foreground">AI Code Review</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3 md:p-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <SpinIcon className="h-8 w-8 text-primary" />
                <p className="text-sm text-muted-foreground">Reviewing your code...</p>
              </div>
            ) : review ? (
              <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{review}</div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground text-center">
                <CodeIcon className="w-8 h-8 md:w-10 md:h-10 opacity-20" />
                <p className="text-sm">Write some code and click "AI Review" to get feedback</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── New Lesson ───────────────────────────────────────────────────────────────

const NL_GRADES = ['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'];
const NL_STREAMS: Record<string, string[]> = {
  'Grade 11': ['Science', 'Commerce', 'Arts'],
  'Grade 12': ['Science', 'Commerce', 'Arts'],
};
const NL_SUBJECTS_MAP: Record<string, string[]> = {
  'Grade 1': ['English','Mathematics','Environmental Studies','Hindi'],
  'Grade 2': ['English','Mathematics','Environmental Studies','Hindi'],
  'Grade 3': ['English','Mathematics','Science','Hindi'],
  'Grade 4': ['English','Mathematics','Science','Social Studies','Hindi'],
  'Grade 5': ['English','Mathematics','Science','Social Studies','Hindi'],
  'Grade 6': ['English','Mathematics','Science','Social Studies','Hindi','Sanskrit'],
  'Grade 7': ['English','Mathematics','Science','Social Studies','Hindi','Sanskrit'],
  'Grade 8': ['English','Mathematics','Science','Social Studies','Hindi','Sanskrit'],
  'Grade 9': ['English','Mathematics','Physics','Chemistry','Biology','History','Geography','Economics','Hindi'],
  'Grade 10': ['English','Mathematics','Physics','Chemistry','Biology','History','Geography','Economics','Hindi'],
  'Grade 11 Science': ['Physics','Chemistry','Mathematics','Biology','Computer Science','English'],
  'Grade 11 Commerce': ['Accountancy','Business Studies','Economics','Mathematics','English'],
  'Grade 11 Arts': ['History','Geography','Political Science','Economics','Sociology','English'],
  'Grade 12 Science': ['Physics','Chemistry','Mathematics','Biology','Computer Science','English'],
  'Grade 12 Commerce': ['Accountancy','Business Studies','Economics','Mathematics','English'],
  'Grade 12 Arts': ['History','Geography','Political Science','Economics','Sociology','English'],
};

const EXPLANATION_TYPES = [
  { id: 'story', label: 'Story', emoji: '📖', desc: 'Learn through a narrative story' },
  { id: 'explanation', label: 'Explanation', emoji: '💡', desc: 'Clear concept breakdown' },
  { id: 'worksheet', label: 'Worksheet', emoji: '📝', desc: 'Practice with exercises' },
  { id: 'analogy', label: 'Analogy', emoji: '🔗', desc: 'Understand via real-life comparisons' },
  { id: 'qa', label: 'Q&A', emoji: '❓', desc: 'Learn through questions & answers' },
  { id: 'summary', label: 'Summary', emoji: '📋', desc: 'Quick concise overview' },
];

function NewLessonView({ onBack }: { onBack: () => void }) {
  const [grade, setGrade] = useState('Grade 9');
  const [stream, setStream] = useState('Science');
  const [subject, setSubject] = useState('Physics');
  const [topic, setTopic] = useState('');
  const [explanationType, setExplanationType] = useState('explanation');
  const [language, setLanguage] = useState('English');
  const [lessonContent, setLessonContent] = useState('');
  const { response, isLoading, error, sendMessage } = useChat('PERPLEXITY', 'perplexity/sonar-pro', false);

  useEffect(() => { if (error) toast.error(error.message); }, [error]);
  useEffect(() => { if (response && !isLoading) setLessonContent(response); }, [response, isLoading]);

  const hasStream = NL_STREAMS[grade] !== undefined;
  const subjectKey = hasStream ? `${grade} ${stream}` : grade;
  const subjects = NL_SUBJECTS_MAP[subjectKey] ?? NL_SUBJECTS_MAP['Grade 9'];

  useEffect(() => {
    if (!subjects.includes(subject)) setSubject(subjects[0]);
  }, [grade, stream]);

  const handleGenerate = () => {
    if (!topic.trim()) { toast.error('Please enter a topic'); return; }
    setLessonContent('');

    const typePrompts: Record<string, string> = {
      story: `Write an engaging educational story that teaches "${topic}" for ${grade} students${hasStream ? ` (${stream} stream)` : ''}. Make it narrative and fun while covering the key concepts.`,
      explanation: `Provide a clear, structured explanation of "${topic}" for ${grade} students${hasStream ? ` (${stream} stream)` : ''}. Break it down step by step with key points, definitions, and examples.`,
      worksheet: `Create a worksheet on "${topic}" for ${grade} students${hasStream ? ` (${stream} stream)` : ''}. Include: brief concept summary, 5 fill-in-the-blank questions, 3 short answer questions, and 2 application problems.`,
      analogy: `Explain "${topic}" for ${grade} students${hasStream ? ` (${stream} stream)` : ''} using real-life analogies and comparisons. Make abstract concepts relatable and easy to understand.`,
      qa: `Create a Q&A lesson on "${topic}" for ${grade} students${hasStream ? ` (${stream} stream)` : ''}. Format as 8-10 question-answer pairs that progressively build understanding of the topic.`,
      summary: `Write a concise summary of "${topic}" for ${grade} students${hasStream ? ` (${stream} stream)` : ''}. Include: key concepts, important formulas or dates, main takeaways, and 3 quick review points.`,
    };

    sendMessage([
      { role: 'system', content: `You are an expert educational content creator for Indian school curriculum (CBSE/ICSE). Create content in ${language}. Be clear, engaging, and age-appropriate for ${grade} students.` },
      { role: 'user', content: `Subject: ${subject}\n\n${typePrompts[explanationType]}` },
    ], { temperature: 0.7, max_tokens: 1800 });
  };

  const selectedType = EXPLANATION_TYPES.find(t => t.id === explanationType);

  return (
    <div className="flex flex-col h-full">
      <ViewHeader onBack={onBack} icon={<BookIcon />} title="New Lesson" subtitle="Personalized lessons for your class & stream" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-4 md:space-y-5">
            {/* Grade */}
            <div className="bg-card rounded-2xl border border-border p-4 md:p-5">
              <h3 className="font-semibold text-sm text-foreground mb-3">Class / Grade</h3>
              <div className="flex flex-wrap gap-2">
                {NL_GRADES.map(g => (
                  <button key={g} onClick={() => setGrade(g)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95 ${grade === g ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'}`}>
                    {g.replace('Grade ', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Stream (11-12 only) */}
            {hasStream && (
              <div className="bg-card rounded-2xl border border-border p-4 md:p-5">
                <h3 className="font-semibold text-sm text-foreground mb-3">Stream / Course</h3>
                <div className="flex gap-2">
                  {NL_STREAMS[grade].map(s => (
                    <button key={s} onClick={() => setStream(s)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${stream === s ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Subject */}
            <div className="bg-card rounded-2xl border border-border p-4 md:p-5">
              <h3 className="font-semibold text-sm text-foreground mb-3">Subject</h3>
              <select value={subject} onChange={e => setSubject(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                {subjects.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Language */}
            <div className="bg-card rounded-2xl border border-border p-4 md:p-5">
              <h3 className="font-semibold text-sm text-foreground mb-3">Language</h3>
              <select value={language} onChange={e => setLanguage(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                {['English','Hindi','Bengali','Telugu','Marathi','Tamil','Gujarati','Kannada'].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* Type + Topic */}
          <div className="space-y-4 md:space-y-5">
            {/* Explanation Type */}
            <div className="bg-card rounded-2xl border border-border p-4 md:p-5">
              <h3 className="font-semibold text-sm text-foreground mb-3">Type of Explanation</h3>
              <div className="grid grid-cols-2 gap-2">
                {EXPLANATION_TYPES.map(t => (
                  <button key={t.id} onClick={() => setExplanationType(t.id)}
                    className={`flex flex-col items-start gap-1 p-2.5 md:p-3 rounded-xl border-2 transition-all text-left active:scale-95 ${explanationType === t.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-muted'}`}>
                    <span className="text-base md:text-lg">{t.emoji}</span>
                    <span className={`text-xs font-bold ${explanationType === t.id ? 'text-primary' : 'text-foreground'}`}>{t.label}</span>
                    <span className="text-xs text-muted-foreground leading-tight hidden sm:block">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Topic */}
            <div className="bg-card rounded-2xl border border-border p-4 md:p-5">
              <h3 className="font-semibold text-sm text-foreground mb-1">Topic / Chapter</h3>
              <p className="text-xs text-muted-foreground mb-3">Enter the topic you want to learn about</p>
              <textarea value={topic} onChange={e => setTopic(e.target.value)} rows={3}
                placeholder="e.g. Laws of Motion, Photosynthesis, French Revolution..."
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none mb-3" />
              <button onClick={handleGenerate} disabled={isLoading || !topic.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition active:scale-95">
                {isLoading
                  ? <><SpinIcon />Generating {selectedType?.label}...</>
                  : <><SparkleIcon className="w-4 h-4" />Generate {selectedType?.label}</>}
              </button>
            </div>
          </div>
        </div>

        {/* Generated Lesson */}
        {isLoading && !lessonContent && (
          <div className="mt-6 bg-card rounded-2xl border border-border p-8 text-center">
            <SpinIcon className="animate-spin h-8 w-8 text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Creating your personalized {selectedType?.label?.toLowerCase()}...</p>
          </div>
        )}
        {lessonContent && (
          <div className="mt-6 bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedType?.emoji}</span>
                <div>
                  <h3 className="font-bold text-foreground text-sm">{selectedType?.label}: {topic}</h3>
                  <p className="text-xs text-muted-foreground">{grade}{hasStream ? ` · ${stream}` : ''} · {subject} · {language}</p>
                </div>
              </div>
              <button onClick={handleGenerate} disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition">
                <RefreshIcon /> Regenerate
              </button>
            </div>
            <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap border-t border-border pt-4">{lessonContent}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Flashcards ───────────────────────────────────────────────────────────────

interface Flashcard { front: string; back: string; exampleQuestion?: string; }

function FlashcardsView({ onBack }: { onBack: () => void }) {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const { response, isLoading, error, sendMessage } = useChat('PERPLEXITY', 'perplexity/sonar-pro', false);

  useEffect(() => { if (error) toast.error(error.message); }, [error]);
  useEffect(() => {
    if (response && !isLoading) {
      const parsed = parseFlashcards(response);
      if (parsed.length > 0) { setCards(parsed); setCurrentIdx(0); setFlipped(false); }
      else toast.error('Could not parse flashcards. Try again.');
    }
  }, [response, isLoading]);

  const parseFlashcards = (text: string): Flashcard[] => {
    const cards: Flashcard[] = [];
    const lines = text.split('\n');
    let front = '', back = '', exampleQuestion = '';
    for (const line of lines) {
      const t = line.trim();
      if (t.match(/^(Q:|Question:|Front:|Term:|Card \d+:)/i)) {
        front = t.replace(/^(Q:|Question:|Front:|Term:|Card \d+:)\s*/i, '');
        exampleQuestion = '';
      } else if (t.match(/^(A:|Answer:|Back:|Definition:|Explanation:)/i)) {
        back = t.replace(/^(A:|Answer:|Back:|Definition:|Explanation:)\s*/i, '');
      } else if (t.match(/^(Example:|Example Question:|EQ:|Try:)/i)) {
        exampleQuestion = t.replace(/^(Example:|Example Question:|EQ:|Try:)\s*/i, '');
        if (front && back) {
          cards.push({ front, back, exampleQuestion });
          front = ''; back = ''; exampleQuestion = '';
        }
      } else if (front && back && !exampleQuestion && t === '') {
        // push card without example if blank line separates
      }
    }
    // push last card if no trailing example line
    if (front && back) cards.push({ front, back, exampleQuestion: exampleQuestion || undefined });
    return cards;
  };

  const handleGenerate = () => {
    if (!topic.trim()) { toast.error('Please enter a topic'); return; }
    setCards([]);
    sendMessage([
      { role: 'system', content: 'You are an educational flashcard creator. Create exactly 8 flashcard pairs. Format each card as:\nQ: [question or term]\nA: [answer or definition]\nExample: [a short example question the student can try]\n\nMake them concise and educational. Always include the Example line for every card.' },
      { role: 'user', content: `Create 8 flashcards for "${topic}" in ${subject} for school students.` },
    ], { temperature: 0.6, max_tokens: 1200 });
  };

  const current = cards[currentIdx];

  return (
    <div className="flex flex-col h-full">
      <ViewHeader onBack={onBack} icon={<LayersIcon />} title="Flashcards" subtitle="Study with spaced repetition" />
      <div className="flex-1 overflow-y-auto p-6">
        {/* Generator */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-card rounded-2xl border border-border p-5">
            <h3 className="font-semibold text-sm text-foreground mb-4">Generate Flashcards</h3>
            <div className="flex gap-3 mb-3">
              <input value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleGenerate(); }}
                placeholder="Enter topic (e.g., Photosynthesis, Algebra...)"
                className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              <select value={subject} onChange={e => setSubject(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none">
                {['Mathematics','Science','History','Geography','English','Physics','Chemistry','Biology'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <button onClick={handleGenerate} disabled={isLoading || !topic.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition">
              {isLoading ? <><SpinIcon />Generating...</> : <><SparkleIcon className="w-4 h-4" />Generate Flashcards</>}
            </button>
          </div>
        </div>

        {/* Flashcard Display */}
        {cards.length > 0 && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-4">
              <span className="text-sm text-muted-foreground">{currentIdx + 1} / {cards.length}</span>
            </div>
            {/* Card */}
            <div onClick={() => setFlipped(!flipped)} className="cursor-pointer mb-4" style={{ perspective: '1000px' }}>
              <div className={`relative w-full transition-transform duration-500`} style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)', minHeight: '220px' }}>
                {/* Front */}
                <div className="absolute inset-0 bg-card border-2 border-primary/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center" style={{ backfaceVisibility: 'hidden' }}>
                  <span className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Question</span>
                  <p className="text-lg font-semibold text-foreground">{current.front}</p>
                  <p className="text-xs text-muted-foreground mt-4">Click to reveal answer</p>
                </div>
                {/* Back */}
                <div className="absolute inset-0 bg-primary/5 border-2 border-primary rounded-2xl p-6 flex flex-col items-center justify-center text-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                  <span className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Answer</span>
                  <p className="text-base text-foreground leading-relaxed mb-4">{current.back}</p>
                  {current.exampleQuestion && (
                    <div className="w-full mt-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                      <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">📝 Example Question</p>
                      <p className="text-sm text-amber-900">{current.exampleQuestion}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Example Question shown below card (always visible) */}
            {current.exampleQuestion && (
              <div className="max-w-2xl mx-auto mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2">
                <span className="text-base mt-0.5">📝</span>
                <div>
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-0.5">Example Question</p>
                  <p className="text-sm text-amber-900">{current.exampleQuestion}</p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => { setCurrentIdx(Math.max(0, currentIdx - 1)); setFlipped(false); }} disabled={currentIdx === 0}
                className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted disabled:opacity-40 transition">← Prev</button>
              <button onClick={() => setFlipped(!flipped)} className="px-5 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition">Flip</button>
              <button onClick={() => { setCurrentIdx(Math.min(cards.length - 1, currentIdx + 1)); setFlipped(false); }} disabled={currentIdx === cards.length - 1}
                className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted disabled:opacity-40 transition">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────

interface QuizQuestion { question: string; options: string[]; correct: number; explanation: string; }

function QuizView({ onBack }: { onBack: () => void }) {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const { response, isLoading, error, sendMessage } = useChat('PERPLEXITY', 'perplexity/sonar-pro', false);

  useEffect(() => { if (error) toast.error(error.message); }, [error]);
  useEffect(() => {
    if (response && !isLoading) {
      try {
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setQuestions(parsed); setCurrentQ(0); setScore(0); setFinished(false); setSelected(null); setAnswered(false);
        } else toast.error('Could not parse quiz. Try again.');
      } catch { toast.error('Could not parse quiz. Try again.'); }
    }
  }, [response, isLoading]);

  const handleGenerate = () => {
    if (!topic.trim()) { toast.error('Please enter a topic'); return; }
    setQuestions([]);
    sendMessage([
      { role: 'system', content: 'You are a quiz creator. Return ONLY a valid JSON array of 5 quiz questions. Each question must have: "question" (string), "options" (array of 4 strings), "correct" (0-indexed number), "explanation" (string). No other text.' },
      { role: 'user', content: `Create a 5-question MCQ quiz about "${topic}" in ${subject} for school students.` },
    ], { temperature: 0.5, max_tokens: 1500 });
  };

  const handleAnswer = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === questions[currentQ].correct) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) { setCurrentQ(q => q + 1); setSelected(null); setAnswered(false); }
    else setFinished(true);
  };

  const q = questions[currentQ];

  return (
    <div className="flex flex-col h-full">
      <ViewHeader onBack={onBack} icon={<QuizIcon />} title="Quiz Player" subtitle="Test your knowledge with AI-generated quizzes" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          {/* Generator */}
          {questions.length === 0 && !finished && (
            <div className="bg-card rounded-2xl border border-border p-5 mb-6">
              <h3 className="font-semibold text-sm text-foreground mb-4">Generate Quiz</h3>
              <div className="flex gap-3 mb-3">
                <input value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleGenerate(); }}
                  placeholder="Enter topic for quiz..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                <select value={subject} onChange={e => setSubject(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none">
                  {['Mathematics','Science','History','Geography','English','Physics','Chemistry','Biology'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <button onClick={handleGenerate} disabled={isLoading || !topic.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition">
                {isLoading ? <><SpinIcon />Generating Quiz...</> : <><SparkleIcon className="w-4 h-4" />Generate Quiz</>}
              </button>
            </div>
          )}

          {/* Quiz */}
          {questions.length > 0 && !finished && q && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-muted-foreground">Question {currentQ + 1} of {questions.length}</span>
                <span className="text-sm font-semibold text-primary">Score: {score}/{questions.length}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-6">
                <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${((currentQ) / questions.length) * 100}%` }} />
              </div>
              <h3 className="font-semibold text-foreground text-base mb-5">{q.question}</h3>
              <div className="space-y-3 mb-6">
                {q.options.map((opt, i) => (
                  <button key={i} onClick={() => handleAnswer(i)} disabled={answered}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition ${
                      answered
                        ? i === q.correct ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                          : i === selected ? 'border-red-400 bg-red-50 text-red-800' :'border-border text-muted-foreground' :'border-border hover:border-primary/50 hover:bg-primary/5 text-foreground'
                    }`}>
                    <span className="font-semibold mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
                  </button>
                ))}
              </div>
              {answered && (
                <div className={`p-4 rounded-xl mb-4 text-sm ${selected === q.correct ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                  <strong>{selected === q.correct ? '✓ Correct!' : '✗ Incorrect.'}</strong> {q.explanation}
                </div>
              )}
              {answered && (
                <button onClick={handleNext} className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition">
                  {currentQ < questions.length - 1 ? 'Next Question →' : 'See Results'}
                </button>
              )}
            </div>
          )}

          {/* Results */}
          {finished && (
            <div className="bg-card rounded-2xl border border-border p-8 text-center">
              <div className="text-5xl mb-4">{score === questions.length ? '🏆' : score >= questions.length / 2 ? '🎉' : '📚'}</div>
              <h3 className="text-2xl font-bold text-foreground mb-2">{score}/{questions.length}</h3>
              <p className="text-muted-foreground mb-6">{score === questions.length ? 'Perfect score! Amazing!' : score >= questions.length / 2 ? 'Good job! Keep practicing!' : 'Keep studying, you\'ll get there!'}</p>
              <button onClick={() => { setQuestions([]); setTopic(''); }} className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition">Try Another Quiz</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Daily Challenges ─────────────────────────────────────────────────────────

function DailyChallengesView({ onBack }: { onBack: () => void }) {
  const [subject, setSubject] = useState('Mathematics');
  const [grade, setGrade] = useState('Grade 9');
  const [challenge, setChallenge] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [xp, setXp] = useState(() => { try { return parseInt(localStorage.getItem('eduai-xp') || '0'); } catch { return 0; } });
  const { response: challengeResponse, isLoading: challengeLoading, error: challengeError, sendMessage: sendChallenge } = useChat('PERPLEXITY', 'perplexity/sonar-pro', false);
  const { response: feedbackResponse, isLoading: feedbackLoading, error: feedbackError, sendMessage: sendFeedback } = useChat('PERPLEXITY', 'perplexity/sonar-pro', false);

  useEffect(() => { if (challengeError) toast.error(challengeError.message); }, [challengeError]);
  useEffect(() => { if (feedbackError) toast.error(feedbackError.message); }, [feedbackError]);
  useEffect(() => { if (challengeResponse && !challengeLoading) setChallenge(challengeResponse); }, [challengeResponse, challengeLoading]);
  useEffect(() => {
    if (feedbackResponse && !feedbackLoading) {
      setFeedback(feedbackResponse);
      const earned = 10;
      const newXp = xp + earned;
      setXp(newXp);
      localStorage.setItem('eduai-xp', String(newXp));
      toast.success(`+${earned} XP earned!`);
    }
  }, [feedbackResponse, feedbackLoading]);

  const handleGetChallenge = () => {
    setChallenge(''); setFeedback(''); setAnswer('');
    sendChallenge([
      { role: 'system', content: 'You are a daily challenge creator for school students. Create one engaging practice problem. Include: the problem statement, difficulty level (Easy/Medium/Hard), and a hint. Format with clear sections.' },
      { role: 'user', content: `Create a daily challenge problem for ${grade} students in ${subject}.` },
    ], { temperature: 0.8, max_tokens: 500 });
  };

  const handleSubmit = () => {
    if (!answer.trim()) { toast.error('Please write your answer'); return; }
    sendFeedback([
      { role: 'system', content: 'You are a helpful teacher. Evaluate the student\'s answer to the challenge problem. Be encouraging, explain if correct or incorrect, and provide the full solution.' },
      { role: 'user', content: `Challenge:\n${challenge}\n\nStudent's answer:\n${answer}\n\nPlease evaluate this answer.` },
    ], { temperature: 0.5, max_tokens: 800 });
  };

  return (
    <div className="flex flex-col h-full">
      <ViewHeader onBack={onBack} icon={<FlameIcon />} title="Daily Challenges" subtitle="Practice problems and earn XP" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          {/* XP Bar */}
          <div className="bg-card rounded-2xl border border-border p-4 mb-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-2xl">🔥</div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm text-foreground">Your XP</span>
                <span className="font-bold text-primary">{xp} XP</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, (xp % 100))}%` }} />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-card rounded-2xl border border-border p-5 mb-6">
            <div className="flex gap-3 mb-4">
              <select value={grade} onChange={e => setGrade(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none">
                {GRADES.map(g => <option key={g}>{g}</option>)}
              </select>
              <select value={subject} onChange={e => setSubject(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none">
                {['Mathematics','Science','Physics','Chemistry','Biology','History','Geography','English'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <button onClick={handleGetChallenge} disabled={challengeLoading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 disabled:opacity-50 transition">
              {challengeLoading ? <><SpinIcon />Loading Challenge...</> : <>🎯 Get Today's Challenge</>}
            </button>
          </div>

          {/* Challenge */}
          {challenge && (
            <div className="bg-card rounded-2xl border border-border p-6 mb-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><span>📋</span> Challenge</h3>
              <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap mb-5">{challenge}</div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Your Answer</label>
              <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={4}
                placeholder="Write your solution here..."
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none mb-3" />
              <button onClick={handleSubmit} disabled={feedbackLoading || !answer.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition">
                {feedbackLoading ? <><SpinIcon />Checking...</> : <>✓ Submit Answer</>}
              </button>
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
              <h3 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2"><span>✨</span> Feedback</h3>
              <div className="text-sm text-emerald-900 leading-relaxed whitespace-pre-wrap">{feedback}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Settings Modal ───────────────────────────────────────────────────────────

function SettingsModal({ settings, onSave, onClose }: { settings: SettingsData; onSave: (s: SettingsData) => void; onClose: () => void }) {
  const [form, setForm] = useState(settings);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl border border-border w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-bold text-foreground text-lg">Settings</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition"><CloseIcon /></button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Display Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <SelectField label="Default Grade" value={form.grade} onChange={v => setForm(f => ({ ...f, grade: v }))} options={GRADES} />
          <SelectField label="Default Language" value={form.language} onChange={v => setForm(f => ({ ...f, language: v }))} options={LANGUAGES} />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Notifications</span>
            <button onClick={() => setForm(f => ({ ...f, notifications: !f.notifications }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.notifications ? 'bg-primary' : 'bg-muted'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.notifications ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
        <div className="p-6 border-t border-border flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition">Cancel</button>
          <button onClick={() => onSave(form)} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Modal ────────────────────────────────────────────────────────────

function ProfileModal({ settings, history, onClose }: { settings: SettingsData; history: HistoryItem[]; onClose: () => void }) {
  const xp = typeof window !== 'undefined' ? parseInt(localStorage.getItem('eduai-xp') || '0') : 0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl border border-border w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-bold text-foreground text-lg">My Profile</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition"><CloseIcon /></button>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold text-2xl">
              {settings.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-foreground text-lg">{settings.name}</h3>
              <p className="text-sm text-muted-foreground">{settings.grade} · {settings.language}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-muted rounded-xl p-3 text-center">
              <div className="font-bold text-foreground text-xl">{history.length}</div>
              <div className="text-xs text-muted-foreground">Lessons</div>
            </div>
            <div className="bg-muted rounded-xl p-3 text-center">
              <div className="font-bold text-foreground text-xl">{xp}</div>
              <div className="text-xs text-muted-foreground">XP Earned</div>
            </div>
            <div className="bg-muted rounded-xl p-3 text-center">
              <div className="font-bold text-foreground text-xl">🔥</div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
          </div>
          {history.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Recent Activity</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {history.slice(0, 5).map(h => (
                  <div key={h.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted">
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{h.type}</span>
                    <span className="text-xs text-foreground truncate flex-1">{h.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-border">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition">Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── Shared Components ────────────────────────────────────────────────────────

function ViewHeader({ onBack, icon, title, subtitle }: { onBack: () => void; icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="px-6 py-4 border-b border-border bg-card flex items-center gap-4 shrink-0">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
        <ChevronLeftIcon /> Back
      </button>
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">{icon}</div>
        <div>
          <h2 className="font-bold text-foreground text-sm">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs text-muted-foreground">Online</span>
      </div>
    </div>
  );
}

interface SelectFieldProps { label: string; value: string; onChange: (v: string) => void; options: string[]; }
function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  return (
    <div>
      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{label}</label>
      <div className="relative">
        <select value={value} onChange={e => onChange(e.target.value)}
          className="w-full appearance-none px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer pr-10">
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </div>
      </div>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function BotIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg>;
}
function CodeIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m18 16 4-4-4-4" /><path d="m6 8-4 4 4 4" /><path d="m14.5 4-5 16" /></svg>;
}
function LayersIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" /><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" /><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" /></svg>;
}
function FlameIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>;
}
function BookIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 7v14" /><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" /></svg>;
}
function FileIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></svg>;
}
function CalcIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="16" height="20" x="4" y="2" rx="2" /><line x1="8" x2="16" y1="6" y2="6" /><line x1="16" x2="16" y1="14" y2="18" /><path d="M16 10h.01" /><path d="M12 10h.01" /><path d="M8 10h.01" /><path d="M12 14h.01" /><path d="M8 14h.01" /><path d="M12 18h.01" /><path d="M8 18h.01" /></svg>;
}
function VideoIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" /><rect x="2" y="6" width="14" height="12" rx="2" /></svg>;
}
function QuizIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>;
}
function ExplainIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" /></svg>;
}
function SparkleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" /></svg>;
}
function ChevronLeftIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>;
}
function SendIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>;
}
function CopyIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></svg>;
}
function RefreshIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>;
}
function BookmarkIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>;
}
function CloseIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>;
}
function SpinIcon({ className = 'animate-spin h-4 w-4' }: { className?: string }) {
  return <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>;
}
