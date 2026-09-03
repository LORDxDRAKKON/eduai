'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import AssignmentsSection from './components/AssignmentsSection';
import StudentsSection from './components/StudentsSection';
import {
  generateLesson,
  generateFlashcards,
  generateChallenges,
  generateCodeReview,
  generateTutorResponse,
} from '@/lib/ai/templateEngine';

interface TeacherProfile {
  full_name: string;
  email: string;
}

type MainView = 'dashboard' | 'assignments' | 'students' | 'ai-tutor' | 'code-playground' | 'flashcards' | 'daily-challenges' | 'new-lesson' | 'offline-answers';

// ── Offline Answer System ──────────────────────────────────────────────────
const OFFLINE_QA: { q: string; a: string; category: string }[] = [
  { category: 'Math', q: 'What is the quadratic formula?', a: 'x = (−b ± √(b²−4ac)) / 2a. Use it to solve ax² + bx + c = 0.' },
  { category: 'Math', q: 'How do you find the area of a circle?', a: 'Area = π × r², where r is the radius of the circle.' },
  { category: 'Math', q: 'What is the Pythagorean theorem?', a: 'In a right triangle: a² + b² = c², where c is the hypotenuse.' },
  { category: 'Math', q: 'How do you calculate percentage?', a: 'Percentage = (Part / Whole) × 100. Example: 25/50 × 100 = 50%.' },
  { category: 'Science', q: 'What is Newton\'s First Law?', a: 'An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force.' },
  { category: 'Science', q: 'What is photosynthesis?', a: 'The process by which plants use sunlight, water, and CO₂ to produce glucose and oxygen: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂.' },
  { category: 'Science', q: 'What is the speed of light?', a: 'Approximately 299,792,458 metres per second (≈ 3 × 10⁸ m/s) in a vacuum.' },
  { category: 'English', q: 'What is a metaphor?', a: 'A figure of speech that directly compares two unlike things without using "like" or "as". Example: "Life is a journey."' },
  { category: 'English', q: 'What is the difference between a simile and a metaphor?', a: 'A simile uses "like" or "as" (e.g., "brave as a lion"), while a metaphor states the comparison directly (e.g., "He is a lion").' },
  { category: 'History', q: 'When did World War II end?', a: 'World War II ended in 1945 — in Europe on 8 May (V-E Day) and in the Pacific on 2 September (V-J Day).' },
  { category: 'History', q: 'What was the Industrial Revolution?', a: 'A period of major industrialisation (c. 1760–1840) that transformed manufacturing, agriculture, and society, beginning in Britain.' },
  { category: 'Geography', q: 'What is the largest continent?', a: 'Asia is the largest continent, covering about 44.6 million km² — roughly 30% of Earth\'s total land area.' },
];

function OfflineAnswerSystem() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [offlineResults, setOfflineResults] = useState<typeof OFFLINE_QA>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [hasSearched, setHasSearched] = useState(false);

  const categories = ['All', ...Array.from(new Set(OFFLINE_QA.map(q => q.category)))];
  const filteredBank = activeCategory === 'All' ? OFFLINE_QA : OFFLINE_QA.filter(q => q.category === activeCategory);

  const handleSearch = () => {
    if (!query.trim()) return;
    setHasSearched(true);

    // Offline fuzzy match
    const lower = query.toLowerCase();
    const matched = OFFLINE_QA.filter(
      item =>
        item.q.toLowerCase().includes(lower) ||
        item.a.toLowerCase().includes(lower) ||
        item.category.toLowerCase().includes(lower)
    );
    setOfflineResults(matched);

    // Rule-based answer
    const generated = generateTutorResponse(query);
    setAnswer(generated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-1">Offline Answer System</h2>
        <p className="text-sm text-gray-500">Instant answers from the built-in knowledge bank</p>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Ask any question… e.g. What is the quadratic formula?"
            className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <button
            onClick={handleSearch}
            disabled={!query.trim()}
            className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            Search
          </button>
        </div>
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="space-y-4">
          {/* Smart Answer */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" /></svg>
              </span>
              <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Smart Answer</p>
            </div>
            {answer ? (
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{answer}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">No answer generated.</p>
            )}
          </div>

          {/* Offline matches */}
          {offlineResults.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Knowledge Bank ({offlineResults.length} match{offlineResults.length !== 1 ? 'es' : ''})</p>
              <div className="space-y-3">
                {offlineResults.map((item, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold shrink-0 mt-0.5">{item.category}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">{item.q}</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {offlineResults.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
              <p className="text-sm text-gray-500">No direct matches found. Check the smart answer above or browse the knowledge bank below.</p>
            </div>
          )}
        </div>
      )}

      {/* Knowledge Bank Browser */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Browse Knowledge Bank</p>
          <div className="flex gap-1.5 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${activeCategory === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredBank.map((item, i) => (
            <button
              key={i}
              onClick={() => { setQuery(item.q); setHasSearched(false); }}
              className="bg-white border border-gray-200 rounded-2xl p-4 text-left hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">{item.category}</span>
              <p className="text-sm font-semibold text-gray-900 mt-2 mb-1">{item.q}</p>
              <p className="text-xs text-gray-500 line-clamp-2">{item.a}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── AI Tutor Panel ─────────────────────────────────────────────────────────
function AiTutorPanel() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const send = () => {
    if (!input.trim() || isLoading) return;
    const userMsg = { role: 'user' as const, content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Simulate a brief processing delay for UX
    setTimeout(() => {
      const responseText = generateTutorResponse(userMsg.content);
      setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-180px)]">
      <div className="mb-4">
        <h2 className="text-xl font-extrabold text-gray-900 mb-1">AI Tutor</h2>
        <p className="text-sm text-gray-500">Ask anything — get clear, educational explanations</p>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 bg-white border border-gray-200 rounded-2xl p-5 mb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 10h8M8 14h5" /></svg>
            </div>
            <p className="text-sm text-gray-500">Start a conversation with your AI Tutor</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask your AI tutor…"
          className="flex-1 text-sm bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <button
          onClick={send}
          disabled={!input.trim() || isLoading}
          className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}

// ── Code Playground Panel ──────────────────────────────────────────────────
function CodePlaygroundPanel() {
  const [code, setCode] = useState('// Write your code here\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("World"));');
  const [language, setLanguage] = useState('JavaScript');
  const [review, setReview] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const reviewCode = () => {
    setReview('');
    setIsLoading(true);
    setTimeout(() => {
      const result = generateCodeReview(language, code);
      setReview(result);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-1">Code Playground</h2>
        <p className="text-sm text-gray-500">Write code and get instant code review</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="text-sm bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {['JavaScript', 'Python', 'Java', 'C++', 'TypeScript', 'HTML', 'CSS', 'SQL'].map(l => <option key={l}>{l}</option>)}
            </select>
            <button
              onClick={reviewCode}
              disabled={isLoading || !code.trim()}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Reviewing…' : 'Review Code'}
            </button>
          </div>
          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            rows={18}
            spellCheck={false}
            className="w-full font-mono text-sm bg-gray-900 text-green-400 border border-gray-700 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Code Review</p>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-indigo-600">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Reviewing your code…
            </div>
          ) : review ? (
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{review}</p>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center gap-2">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
              <p className="text-sm text-gray-400">Click "Review Code" to get feedback on your code</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Flashcards Panel ───────────────────────────────────────────────────────
function FlashcardsPanel() {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [cards, setCards] = useState<{ front: string; back: string; example: string }[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [generating, setGenerating] = useState(false);

  const generate = () => {
    if (!topic.trim()) return;
    setGenerating(true);
    setCards([]);
    setTimeout(() => {
      const generated = generateFlashcards(subject, topic);
      setCards(generated);
      setCurrentIdx(0);
      setFlipped(false);
      setGenerating(false);
    }, 400);
  };

  const card = cards[currentIdx];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-1">Flashcards</h2>
        <p className="text-sm text-gray-500">Generate flashcards for any topic instantly</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl p-5 flex gap-3 flex-wrap">
        <select
          value={subject}
          onChange={e => setSubject(e.target.value)}
          className="text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          {['Mathematics', 'Science', 'English', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology'].map(s => <option key={s}>{s}</option>)}
        </select>
        <input
          type="text"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && generate()}
          placeholder="Enter topic… e.g. Quadratic Equations"
          className="flex-1 min-w-[180px] text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <button
          onClick={generate}
          disabled={!topic.trim() || generating}
          className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {generating ? 'Generating…' : 'Generate'}
        </button>
      </div>

      {generating && (
        <div className="flex items-center justify-center py-12 gap-3 text-indigo-600">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          <span className="text-sm font-medium">Generating flashcards…</span>
        </div>
      )}

      {cards.length > 0 && card && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Card {currentIdx + 1} of {cards.length}</span>
            <div className="flex gap-2">
              <button onClick={() => { setCurrentIdx(i => Math.max(0, i - 1)); setFlipped(false); }} disabled={currentIdx === 0} className="px-3 py-1.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-40">← Prev</button>
              <button onClick={() => { setCurrentIdx(i => Math.min(cards.length - 1, i + 1)); setFlipped(false); }} disabled={currentIdx === cards.length - 1} className="px-3 py-1.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-40">Next →</button>
            </div>
          </div>

          <button
            onClick={() => setFlipped(f => !f)}
            className="w-full min-h-[200px] bg-white border-2 border-indigo-200 rounded-2xl p-8 text-center hover:border-indigo-400 transition-all cursor-pointer"
          >
            {!flipped ? (
              <div>
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-4">Question</p>
                <p className="text-lg font-bold text-gray-900">{card.front}</p>
                <p className="text-xs text-gray-400 mt-6">Click to reveal answer</p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-4">Answer</p>
                <p className="text-base font-semibold text-gray-800 leading-relaxed">{card.back}</p>
              </div>
            )}
          </button>

          {card.example && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Example Question</p>
              <p className="text-sm text-amber-900">{card.example}</p>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {cards.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrentIdx(i); setFlipped(false); }}
                className={`w-8 h-8 rounded-full text-xs font-bold transition-colors ${i === currentIdx ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Daily Challenges Panel ─────────────────────────────────────────────────
function DailyChallengesPanel() {
  const [subject, setSubject] = useState('Mathematics');
  const [difficulty, setDifficulty] = useState('Medium');
  const [challenges, setChallenges] = useState<{ question: string; options: string[]; answer: string; explanation: string }[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [generating, setGenerating] = useState(false);

  const generate = () => {
    setGenerating(true);
    setChallenges([]);
    setTimeout(() => {
      const generated = generateChallenges(subject, difficulty);
      setChallenges(generated);
      setCurrentIdx(0);
      setSelected(null);
      setRevealed(false);
      setScore(0);
      setGenerating(false);
    }, 400);
  };

  const challenge = challenges[currentIdx];
  const isCorrect = selected === challenge?.answer;

  const handleSelect = (opt: string) => {
    if (revealed) return;
    setSelected(opt);
    setRevealed(true);
    if (opt === challenge?.answer) setScore(s => s + 1);
  };

  const next = () => {
    setCurrentIdx(i => i + 1);
    setSelected(null);
    setRevealed(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-1">Daily Challenges</h2>
        <p className="text-sm text-gray-500">Test your knowledge with quiz challenges</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 flex gap-3 flex-wrap items-end">
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Subject</label>
          <select value={subject} onChange={e => setSubject(e.target.value)} className="text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300">
            {['Mathematics', 'Science', 'English', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Difficulty</label>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300">
            {['Easy', 'Medium', 'Hard'].map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <button
          onClick={generate}
          disabled={generating}
          className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {generating ? 'Generating…' : 'Start Challenge'}
        </button>
        {challenges.length > 0 && (
          <div className="ml-auto text-sm font-bold text-indigo-600">Score: {score}/{challenges.length}</div>
        )}
      </div>

      {generating && (
        <div className="flex items-center justify-center py-12 gap-3 text-indigo-600">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          <span className="text-sm font-medium">Generating challenges…</span>
        </div>
      )}

      {challenges.length > 0 && currentIdx < challenges.length && challenge && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Question {currentIdx + 1} of {challenges.length}</span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' : difficulty === 'Hard' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{difficulty}</span>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <p className="text-base font-bold text-gray-900 mb-5">{challenge.question}</p>
            <div className="space-y-2.5">
              {challenge.options.map((opt, i) => {
                let cls = 'bg-gray-50 border-gray-200 text-gray-700 hover:border-indigo-300';
                if (revealed) {
                  if (opt === challenge.answer) cls = 'bg-emerald-50 border-emerald-400 text-emerald-800';
                  else if (opt === selected) cls = 'bg-red-50 border-red-400 text-red-700';
                  else cls = 'bg-gray-50 border-gray-200 text-gray-400';
                } else if (selected === opt) {
                  cls = 'bg-indigo-50 border-indigo-400 text-indigo-800';
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(opt)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${cls}`}
                  >
                    <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
                  </button>
                );
              })}
            </div>
          </div>

          {revealed && (
            <div className={`rounded-2xl p-4 ${isCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`text-sm font-bold mb-1 ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
              </p>
              <p className="text-sm text-gray-700">{challenge.explanation}</p>
            </div>
          )}

          {revealed && currentIdx < challenges.length - 1 && (
            <button onClick={next} className="w-full py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
              Next Question →
            </button>
          )}

          {revealed && currentIdx === challenges.length - 1 && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 text-center">
              <p className="text-2xl font-extrabold text-indigo-700 mb-1">{score}/{challenges.length}</p>
              <p className="text-sm text-indigo-600 mb-4">Challenge Complete!</p>
              <button onClick={generate} className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── New Lesson Panel ───────────────────────────────────────────────────────
const NLP_GRADES = ['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'];
const NLP_STREAMS: Record<string, string[]> = {
  'Grade 11': ['Science', 'Commerce', 'Arts'],
  'Grade 12': ['Science', 'Commerce', 'Arts'],
};
const NLP_SUBJECTS_MAP: Record<string, string[]> = {
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
const NLP_EXPLANATION_TYPES = [
  { id: 'Explanation', label: 'Explanation', emoji: '💡', desc: 'Clear concept breakdown' },
  { id: 'Story', label: 'Story', emoji: '📖', desc: 'Learn through a narrative story' },
  { id: 'Worksheet', label: 'Worksheet', emoji: '📝', desc: 'Practice with exercises' },
  { id: 'Analogy', label: 'Analogy', emoji: '🔗', desc: 'Real-life comparisons' },
  { id: 'Q&A', label: 'Q&A', emoji: '❓', desc: 'Questions & answers' },
  { id: 'Summary', label: 'Summary', emoji: '📋', desc: 'Quick concise overview' },
];
const NLP_LANGUAGES = ['English','Hindi','Bengali','Telugu','Marathi','Tamil','Gujarati','Kannada','Malayalam','Punjabi'];

function NewLessonPanel() {
  const [grade, setGrade] = useState('Grade 8');
  const [stream, setStream] = useState('Science');
  const [subject, setSubject] = useState('Mathematics');
  const [topic, setTopic] = useState('');
  const [type, setType] = useState('Explanation');
  const [language, setLanguage] = useState('English');
  const [lessonContent, setLessonContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const hasStream = NLP_STREAMS[grade] !== undefined;
  const subjectKey = hasStream ? `${grade} ${stream}` : grade;
  const subjects = NLP_SUBJECTS_MAP[subjectKey] ?? NLP_SUBJECTS_MAP['Grade 8'];

  useEffect(() => {
    if (!subjects.includes(subject)) setSubject(subjects[0]);
  }, [grade, stream]);

  const selectedType = NLP_EXPLANATION_TYPES.find(t => t.id === type);

  const generate = () => {
    if (!topic.trim()) return;
    setLessonContent('');
    setIsLoading(true);
    setTimeout(() => {
      const content = generateLesson(grade, subject, topic, type, language);
      setLessonContent(content);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-1">New Lesson</h2>
        <p className="text-sm text-gray-500">Generate a custom lesson for any grade, subject, and style</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        {/* Left column */}
        <div className="space-y-4">
          {/* Grade */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5">
            <h3 className="font-semibold text-sm text-gray-900 mb-3">Class / Grade</h3>
            <div className="flex flex-wrap gap-2">
              {NLP_GRADES.map(g => (
                <button key={g} onClick={() => setGrade(g)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${grade === g ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-gray-900'}`}>
                  {g.replace('Grade ', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Stream (11-12 only) */}
          {hasStream && (
            <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5">
              <h3 className="font-semibold text-sm text-gray-900 mb-3">Stream / Course</h3>
              <div className="flex gap-2">
                {NLP_STREAMS[grade].map(s => (
                  <button key={s} onClick={() => setStream(s)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${stream === s ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-500 hover:border-indigo-300'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subject */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5">
            <h3 className="font-semibold text-sm text-gray-900 mb-3">Subject</h3>
            <select value={subject} onChange={e => setSubject(e.target.value)}
              className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300">
              {subjects.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Language */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5">
            <h3 className="font-semibold text-sm text-gray-900 mb-3">Language</h3>
            <select value={language} onChange={e => setLanguage(e.target.value)}
              className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300">
              {NLP_LANGUAGES.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Explanation Type */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5">
            <h3 className="font-semibold text-sm text-gray-900 mb-3">Type of Explanation</h3>
            <div className="grid grid-cols-2 gap-2">
              {NLP_EXPLANATION_TYPES.map(t => (
                <button key={t.id} onClick={() => setType(t.id)}
                  className={`flex flex-col items-start gap-1 p-2.5 md:p-3 rounded-xl border-2 transition-all text-left ${type === t.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}`}>
                  <span className="text-base md:text-lg">{t.emoji}</span>
                  <span className={`text-xs font-bold ${type === t.id ? 'text-indigo-600' : 'text-gray-900'}`}>{t.label}</span>
                  <span className="text-xs text-gray-500 leading-tight hidden sm:block">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5">
            <h3 className="font-semibold text-sm text-gray-900 mb-1">Topic / Chapter</h3>
            <p className="text-xs text-gray-500 mb-3">Enter the topic you want to teach</p>
            <textarea value={topic} onChange={e => setTopic(e.target.value)} rows={3}
              placeholder="e.g. Quadratic Equations, Photosynthesis, World War II…"
              className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none mb-3" />
            <button onClick={generate} disabled={!topic.trim() || isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50">
              {isLoading
                ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Generating {selectedType?.label}…</>
                : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>Generate {selectedType?.label}</>}
            </button>
          </div>
        </div>
      </div>

      {isLoading && !lessonContent && (
        <div className="flex items-center justify-center py-12 gap-3 text-indigo-600">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          <span className="text-sm font-medium">Generating your lesson…</span>
        </div>
      )}

      {lessonContent && !isLoading && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">{selectedType?.emoji}</span>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{selectedType?.label}: {topic}</h3>
                <p className="text-xs text-gray-500">{grade}{hasStream ? ` · ${stream}` : ''} · {subject} · {language}</p>
              </div>
            </div>
            <button onClick={generate} disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
              Regenerate
            </button>
          </div>
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap border-t border-gray-100 pt-4">{lessonContent}</div>
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard View ────────────────────────────────────────────────────
export default function TeacherDashboardPage() {
  const { user, userRole, loading, signOut } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [greeting, setGreeting] = useState('Good Morning');
  const [activeView, setActiveView] = useState<MainView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const h = new Date().getHours();
    if (h >= 12 && h < 17) setGreeting('Good Afternoon');
    else if (h >= 17) setGreeting('Good Evening');
  }, []);

  useEffect(() => {
    if (!loading && !user) router.push('/sign-up-login-screen');
    if (!loading && user && userRole === 'student') router.push('/');
  }, [user, userRole, loading, router]);

  useEffect(() => {
    if (user) {
      supabase
        .from('user_profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single()
        .then(({ data }) => { if (data) setProfile(data); });
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-up-login-screen');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-indigo-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-gray-500">Loading…</p>
        </div>
      </div>
    );
  }

  const teacherName = profile?.full_name || user?.email?.split('@')[0] || 'Teacher';
  const teacherInitial = teacherName.charAt(0).toUpperCase();

  const sidebarItems: { id: MainView; label: string; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
    },
    {
      id: 'assignments',
      label: 'Assignments',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></svg>,
    },
    {
      id: 'students',
      label: 'Students',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    },
    {
      id: 'offline-answers',
      label: 'Offline Answers',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>,
    },
  ];

  const skillItems: { id: MainView; label: string; icon: React.ReactNode }[] = [
    {
      id: 'ai-tutor',
      label: 'AI Tutor',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 10h8M8 14h5" /></svg>,
    },
    {
      id: 'code-playground',
      label: 'Code Playground',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
    },
    {
      id: 'flashcards',
      label: 'Flashcards',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" /><path d="M2 10h20" /></svg>,
    },
    {
      id: 'daily-challenges',
      label: 'Daily Challenges',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>,
    },
  ];

  const generateContentCards = [
    { id: 'create-story', label: 'Create a Story', desc: 'For engaging lessons', iconBg: 'bg-orange-100', iconColor: 'text-orange-500', href: '/content-generation-screen', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg> },
    { id: 'make-worksheet', label: 'Make Worksheet', desc: 'Quiz & Activities', iconBg: 'bg-blue-100', iconColor: 'text-blue-500', href: '/content-generation-screen', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg> },
    { id: 'solve-problem', label: 'Solve Problem', desc: 'Math & Physics', iconBg: 'bg-green-100', iconColor: 'text-green-600', href: '/content-generation-screen', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="8" y1="6" x2="16" y2="6" /><line x1="8" y1="10" x2="16" y2="10" /><line x1="8" y1="14" x2="12" y2="14" /></svg> },
    { id: 'video-lesson', label: 'Video Lesson', desc: 'Script & Visuals', iconBg: 'bg-purple-100', iconColor: 'text-purple-500', href: '/content-generation-screen', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg> },
  ];

  const renderMainContent = () => {
    switch (activeView) {
      case 'assignments': return <AssignmentsSection />;
      case 'students': return <StudentsSection />;
      case 'ai-tutor': return <AiTutorPanel />;
      case 'code-playground': return <CodePlaygroundPanel />;
      case 'flashcards': return <FlashcardsPanel />;
      case 'daily-challenges': return <DailyChallengesPanel />;
      case 'new-lesson': return <NewLessonPanel />;
      case 'offline-answers': return <OfflineAnswerSystem />;
      default: return (
        <div className="max-w-5xl mx-auto">
          {/* Hero Greeting */}
          <div className="flex flex-col items-center text-center mb-6 md:mb-10">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-3 md:mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
              </svg>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-1 md:mb-2">{greeting}, {teacherName}!</h1>
            <p className="text-gray-500 text-sm md:text-base">Create lessons, manage students, and teach smarter.</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            {[
              { label: 'Assignments', value: '2', icon: '📋', color: 'bg-blue-50', onClick: () => setActiveView('assignments') },
              { label: 'Students', value: '4', icon: '👥', color: 'bg-emerald-50', onClick: () => setActiveView('students') },
              { label: 'Pending Grades', value: '3', icon: '⏳', color: 'bg-amber-50', onClick: () => setActiveView('students') },
              { label: 'Offline Answers', value: `${OFFLINE_QA.length}`, icon: '💡', color: 'bg-purple-50', onClick: () => setActiveView('offline-answers') },
            ].map(stat => (
              <button
                key={stat.label}
                onClick={stat.onClick}
                className={`${stat.color} rounded-2xl p-4 md:p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all border border-transparent hover:border-gray-200 active:scale-95`}
              >
                <p className="text-xl md:text-2xl mb-1 md:mb-2">{stat.icon}</p>
                <p className="text-xl md:text-2xl font-extrabold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
              </button>
            ))}
          </div>

          {/* BUILD YOUR SKILLS */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 md:mb-4 flex items-center gap-2">
              <span>🚀</span> BUILD YOUR SKILLS
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {[
                { id: 'ai-tutor' as MainView, label: 'AI Tutor', desc: 'Chat & learn anything', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-500', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 10h8M8 14h5" /></svg> },
                { id: 'code-playground' as MainView, label: 'Code Playground', desc: 'Write & review code', iconBg: 'bg-teal-100', iconColor: 'text-teal-500', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg> },
                { id: 'flashcards' as MainView, label: 'Flashcards', desc: 'Study with spaced repetition', iconBg: 'bg-orange-100', iconColor: 'text-orange-500', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" /><path d="M2 10h20" /></svg> },
                { id: 'daily-challenges' as MainView, label: 'Daily Challenges', desc: 'Practice & earn XP', iconBg: 'bg-red-100', iconColor: 'text-red-500', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg> },
              ].map(card => (
                <button
                  key={card.id}
                  onClick={() => setActiveView(card.id)}
                  className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95"
                >
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${card.iconBg} ${card.iconColor} flex items-center justify-center mb-3 md:mb-4`}>
                    {card.icon}
                  </div>
                  <p className="font-bold text-gray-900 text-sm mb-0.5 md:mb-1">{card.label}</p>
                  <p className="text-xs text-gray-500">{card.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* GENERATE CONTENT */}
          <div>
            <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 md:mb-4 flex items-center gap-2">
              <span>🎨</span> GENERATE CONTENT
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {generateContentCards.map(card => (
                <Link
                  key={card.id}
                  href={card.href}
                  className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all block active:scale-95"
                >
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${card.iconBg} ${card.iconColor} flex items-center justify-center mb-3 md:mb-4`}>
                    {card.icon}
                  </div>
                  <p className="font-bold text-gray-900 text-sm mb-0.5 md:mb-1">{card.label}</p>
                  <p className="text-xs text-gray-500">{card.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ── Mobile Overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-72 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="h-14 md:h-16 flex items-center px-5 border-b border-gray-100 gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="white" stroke="white" strokeWidth="1" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-base tracking-tight">EDU AI</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* New Lesson Button */}
        <div className="px-4 pt-5 pb-4">
          <button
            onClick={() => { setActiveView('new-lesson'); setSidebarOpen(false); }}
            className="w-full flex items-center justify-center gap-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-semibold text-sm rounded-xl py-2.5 transition-colors active:scale-95"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Lesson
          </button>
        </div>

        {/* Main Nav */}
        <div className="px-4 pb-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Main</p>
          <nav className="space-y-0.5">
            {sidebarItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveView(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  activeView === item.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={activeView === item.id ? 'text-indigo-500' : 'text-gray-400'}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Skill Tools */}
        <div className="px-4 pb-2 mt-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Skill Tools</p>
          <nav className="space-y-0.5">
            {skillItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveView(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  activeView === item.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={activeView === item.id ? 'text-indigo-500' : 'text-gray-400'}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom */}
        <div className="px-4 pb-5 space-y-1 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2 px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
            <span className="text-sm text-green-600 font-medium">Online</span>
          </div>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            My Profile
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
            Settings
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-14 md:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 md:px-6 gap-2 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition flex-shrink-0"
              aria-label="Open menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </button>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 min-w-0">
              <button onClick={() => setActiveView('dashboard')} className="hover:text-gray-900 transition-colors font-medium hidden sm:block flex-shrink-0">Dashboard</button>
              {activeView !== 'dashboard' && (
                <>
                  <span className="hidden sm:block flex-shrink-0">/</span>
                  <span className="text-gray-900 font-semibold capitalize truncate">{activeView.replace(/-/g, ' ')}</span>
                </>
              )}
              {activeView === 'dashboard' && (
                <span className="text-gray-900 font-semibold sm:hidden">Dashboard</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-3 flex-shrink-0">
            <Link
              href="/teacher-admin"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
              <span className="hidden md:inline">Admin Panel</span>
              <span className="md:hidden">Admin</span>
            </Link>

            <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>

            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {teacherInitial}
            </div>

            <button
              onClick={handleSignOut}
              className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
            <button
              onClick={handleSignOut}
              className="sm:hidden p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
              title="Logout"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
}
