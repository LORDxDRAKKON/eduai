'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

interface TeacherProfile {
  full_name: string;
  email: string;
}

export default function TeacherDashboardPage() {
  const { user, userRole, loading, signOut } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [greeting, setGreeting] = useState('Good Morning');
  const [activeSkill, setActiveSkill] = useState<string | null>(null);

  useEffect(() => {
    const h = new Date().getHours();
    if (h >= 12 && h < 17) setGreeting('Good Afternoon');
    else if (h >= 17) setGreeting('Good Evening');
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-up-login-screen');
    }
    if (!loading && user && userRole === 'student') {
      router.push('/');
    }
  }, [user, userRole, loading, router]);

  useEffect(() => {
    if (user) {
      supabase
        .from('user_profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) setProfile(data);
        });
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
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  const teacherName = profile?.full_name || user?.email?.split('@')[0] || 'Teacher';
  const teacherInitial = teacherName.charAt(0).toUpperCase();

  const skillTools = [
    {
      id: 'ai-tutor',
      label: 'AI Tutor',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 10h8M8 14h5" />
        </svg>
      ),
    },
    {
      id: 'code-playground',
      label: 'Code Playground',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
        </svg>
      ),
    },
    {
      id: 'flashcards',
      label: 'Flashcards',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" /><path d="M2 10h20" />
        </svg>
      ),
    },
    {
      id: 'daily-challenges',
      label: 'Daily Challenges',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      ),
    },
  ];

  const buildSkillCards = [
    {
      id: 'ai-tutor',
      label: 'AI Tutor',
      desc: 'Chat & learn anything',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-500',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 10h8M8 14h5" />
        </svg>
      ),
    },
    {
      id: 'code-playground',
      label: 'Code Playground',
      desc: 'Write & review code',
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-500',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
        </svg>
      ),
    },
    {
      id: 'flashcards',
      label: 'Flashcards',
      desc: 'Study with spaced repetition',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-500',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" /><path d="M2 10h20" />
        </svg>
      ),
    },
    {
      id: 'daily-challenges',
      label: 'Daily Challenges',
      desc: 'Practice & earn XP',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-500',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      ),
    },
  ];

  const generateContentCards = [
    {
      id: 'create-story',
      label: 'Create a Story',
      desc: 'For engaging lessons',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-500',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      ),
      href: '#',
    },
    {
      id: 'make-worksheet',
      label: 'Make Worksheet',
      desc: 'Quiz & Activities',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-500',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      href: '#',
    },
    {
      id: 'solve-problem',
      label: 'Solve Problem',
      desc: 'Math & Physics',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2" /><line x1="8" y1="6" x2="16" y2="6" /><line x1="8" y1="10" x2="16" y2="10" /><line x1="8" y1="14" x2="12" y2="14" />
        </svg>
      ),
      href: '#',
    },
    {
      id: 'video-lesson',
      label: 'Video Lesson',
      desc: 'Script & Visuals',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-500',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" />
        </svg>
      ),
      href: '#',
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-gray-100 gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="white" stroke="white" strokeWidth="1" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-base tracking-tight">EDU AI</span>
        </div>

        {/* New Lesson Button */}
        <div className="px-4 pt-5 pb-4">
          <button className="w-full flex items-center justify-center gap-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-semibold text-sm rounded-xl py-2.5 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Lesson
          </button>
        </div>

        {/* Skill Tools */}
        <div className="px-4 pb-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Skill Tools</p>
          <nav className="space-y-0.5">
            {skillTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveSkill(activeSkill === tool.id ? null : tool.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeSkill === tool.id
                    ? 'bg-indigo-50 text-indigo-700 font-medium' :'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-gray-400">{tool.icon}</span>
                {tool.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Recent Lessons */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Recent Lessons</p>
          <div className="flex flex-col items-center justify-center py-6 gap-2">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <p className="text-xs text-gray-400">No history yet.</p>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom: Online, My Profile, Settings */}
        <div className="px-4 pb-5 space-y-1 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2 px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
            <span className="text-sm text-green-600 font-medium">Online</span>
          </div>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            My Profile
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Settings
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6 gap-4 flex-shrink-0">
          {/* Admin Panel Button */}
          <Link
            href="/teacher-admin"
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
            Admin Panel
          </Link>

          {/* Notification Bell */}
          <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>

          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {teacherInitial}
          </div>

          {/* Logout */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 px-8 py-10">
          <div className="max-w-5xl mx-auto">
            {/* Hero Greeting */}
            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
                </svg>
              </div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{greeting}</h1>
              <p className="text-gray-500 text-base">I am EDU AI. Create lessons, practice skills, and learn with AI.</p>
            </div>

            {/* BUILD YOUR SKILLS */}
            <div className="mb-8">
              <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span>🚀</span> BUILD YOUR SKILLS
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {buildSkillCards.map((card) => (
                  <button
                    key={card.id}
                    className="bg-white border border-gray-200 rounded-2xl p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    <div className={`w-12 h-12 rounded-full ${card.iconBg} ${card.iconColor} flex items-center justify-center mb-4`}>
                      {card.icon}
                    </div>
                    <p className="font-bold text-gray-900 text-sm mb-1">{card.label}</p>
                    <p className="text-xs text-gray-500">{card.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* GENERATE CONTENT */}
            <div>
              <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span>🎨</span> GENERATE CONTENT
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {generateContentCards.map((card) => (
                  <Link
                    key={card.id}
                    href={card.href}
                    className="bg-white border border-gray-200 rounded-2xl p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all block"
                  >
                    <div className={`w-12 h-12 rounded-full ${card.iconBg} ${card.iconColor} flex items-center justify-center mb-4`}>
                      {card.icon}
                    </div>
                    <p className="font-bold text-gray-900 text-sm mb-1">{card.label}</p>
                    <p className="text-xs text-gray-500">{card.desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
