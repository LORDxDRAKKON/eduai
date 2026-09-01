'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

type Tab = 'Overview' | 'Lessons' | 'Classes' | 'Assignments' | 'Progress' | 'Q&A Offline';

const TABS: Tab[] = ['Overview', 'Lessons', 'Classes', 'Assignments', 'Progress', 'Q&A Offline'];

const STUDENTS = [
  { name: 'Alex Smith', email: 'student@eduai.com', xp: 0, streak: 0, completion: 0 },
  { name: 'Priya Patel', email: 'student2@eduai.com', xp: 0, streak: 0, completion: 0 },
  { name: 'Jordan Lee', email: 'student3@eduai.com', xp: 0, streak: 0, completion: 0 },
];

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

const TAB_ICONS: Record<Tab, React.ReactNode> = {
  'Overview': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  'Lessons': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
    </svg>
  ),
  'Classes': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  'Assignments': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
  'Progress': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  'Q&A Offline': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
};

export default function TeacherAdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [teacherName, setTeacherName] = useState('Ms. Johnson');
  const [teacherInitial, setTeacherInitial] = useState('M');
  const router = useRouter();
  const { user, signOut } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (user?.id) {
      supabase.from('user_profiles').select('full_name').eq('id', user.id).single().then(({ data }) => {
        if (data?.full_name) {
          setTeacherName(data.full_name);
          setTeacherInitial(data.full_name[0]?.toUpperCase() || 'T');
        }
      });
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    router.push('/teacher-login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="white" stroke="white" strokeWidth="1" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-base">EDU AI</span>
          <span className="ml-1 px-3 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold border border-gray-200">Admin Panel</span>
        </div>

        <div className="flex items-center gap-5">
          <Link href="/teacher-dashboard" className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Dashboard
          </Link>
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            {teacherInitial}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Teacher Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {teacherName} — manage your classes and assignments.</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-8 w-fit overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-white shadow-sm text-gray-900 border border-gray-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {TAB_ICONS[tab]}
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Overview' && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Lessons Created */}
              <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
                <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center mb-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
                  </svg>
                </div>
                <p className="text-3xl font-bold text-indigo-600 mb-1">0</p>
                <p className="text-gray-600 text-sm">Lessons Created</p>
              </div>

              {/* Classes */}
              <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center mb-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <p className="text-3xl font-bold text-emerald-600 mb-1">0</p>
                <p className="text-gray-600 text-sm">Classes</p>
              </div>

              {/* Assignments */}
              <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100">
                <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center mb-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <p className="text-3xl font-bold text-orange-500 mb-1">0</p>
                <p className="text-gray-600 text-sm">Assignments</p>
              </div>

              {/* Total XP Earned */}
              <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-100">
                <div className="w-9 h-9 rounded-lg bg-yellow-100 flex items-center justify-center mb-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </div>
                <p className="text-3xl font-bold text-yellow-500 mb-1">0</p>
                <p className="text-gray-600 text-sm">Total XP Earned</p>
              </div>
            </div>

            {/* Student Activity Table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 text-base">Student Activity</h2>
                <button className="text-indigo-600 text-sm font-medium hover:underline">View all →</button>
              </div>

              <div className="divide-y divide-gray-100">
                {STUDENTS.map((student) => (
                  <div key={student.email} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {getInitials(student.name)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{student.name}</p>
                        <p className="text-gray-500 text-xs">{student.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-5">
                      <div className="flex items-center gap-1.5 text-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#eab308" stroke="#eab308" strokeWidth="1">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                        <span className="text-gray-600 font-medium">{student.xp} XP</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
                        </svg>
                        <span className="text-gray-600 font-medium">{student.streak}d</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                        <span className="text-gray-600 font-medium">{student.completion}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab !== 'Overview' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
              {TAB_ICONS[activeTab]}
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">{activeTab}</h3>
            <p className="text-gray-400 text-sm max-w-xs">This section is coming soon. Manage your {activeTab.toLowerCase()} here.</p>
          </div>
        )}
      </main>
    </div>
  );
}
