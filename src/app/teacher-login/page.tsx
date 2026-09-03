'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

// Client-side rate limit: track attempts in sessionStorage
function getLoginAttempts(): number {
  if (typeof window === 'undefined') return 0;
  const data = sessionStorage.getItem('teacher_login_attempts');
  if (!data) return 0;
  try {
    const parsed = JSON.parse(data);
    if (parsed.resetAt < Date.now()) { sessionStorage.removeItem('teacher_login_attempts'); return 0; }
    return parsed.count;
  } catch { return 0; }
}

function incrementLoginAttempts(): number {
  if (typeof window === 'undefined') return 0;
  const count = getLoginAttempts() + 1;
  const resetAt = Date.now() + 15 * 60 * 1000;
  sessionStorage.setItem('teacher_login_attempts', JSON.stringify({ count, resetAt }));
  return count;
}

function resetLoginAttempts() {
  if (typeof window !== 'undefined') sessionStorage.removeItem('teacher_login_attempts');
}

const MAX_LOGIN_ATTEMPTS = 10;

interface LoginValues { email: string; password: string; }

export default function TeacherLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { signIn } = useAuth();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side rate limit check
    const attempts = getLoginAttempts();
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      setError('Too many login attempts. Please wait 15 minutes before trying again.');
      return;
    }

    // Basic input validation
    const trimmedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const authData = await signIn(trimmedEmail, password);
      let role = 'teacher';
      if (authData?.user?.id) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', authData.user.id)
            .single();
          if (profile?.role) {
            role = profile.role;
          } else if (profileError) {
            await supabase.from('user_profiles').upsert({
              id: authData.user.id,
              email: authData.user.email || '',
              full_name: authData.user.user_metadata?.full_name || '',
              role: 'teacher',
            });
            role = 'teacher';
          }
        } catch {
          role = 'teacher';
        }
      }
      if (role === 'student') {
        setError('This is the teacher login. Please use the student login.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }
      resetLoginAttempts();
      router.push('/teacher-dashboard');
      router.refresh();
    } catch (err: any) {
      incrementLoginAttempts();
      setError(err?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-4 py-10">
      {/* Logo & Title */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center mb-4 shadow-lg">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="white" stroke="white" strokeWidth="1" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">EDU AI</h1>
        <p className="text-gray-500 text-sm mt-1">Teacher Portal</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-600 text-sm font-semibold">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            Teacher Login
          </span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">Welcome back</h2>
        <p className="text-gray-500 text-sm text-center mb-6">Sign in to your teacher account</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="teacher@eduai.com"
              required
              className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 pr-12 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Signing in...
              </>
            ) : 'Sign In as Teacher'}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="mt-5 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-indigo-600 font-semibold text-sm mb-1.5">Demo credentials</p>
          <p className="text-gray-600 text-sm">Email: <span className="font-mono">teacher@eduai.com</span></p>
          <p className="text-gray-600 text-sm">Password: <span className="font-mono">teacher123</span></p>
        </div>
      </div>

      {/* Bottom link */}
      <p className="mt-6 text-gray-500 text-sm">
        Are you a student?{' '}
        <Link href="/student-login" className="text-indigo-600 font-semibold hover:underline">
          Student Login
        </Link>
      </p>
    </div>
  );
}
