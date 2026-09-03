'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

const GRADES = ['1','2','3','4','5','6','7','8','9','10','11','12'];
const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
];

interface SignupValues {
  name: string;
  email: string;
  password: string;
  grade: string;
  language: string;
  terms: boolean;
}

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

export default function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const router = useRouter();
  const { signUp } = useAuth();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignupValues>({ defaultValues: { grade: '9', language: 'en' } });

  const onSubmit = async (data: SignupValues) => {
    setLoading(true);
    try {
      // Sanitize name to prevent XSS
      const safeName = data.name.replace(/[<>]/g, '').trim();
      if (safeName.length < 2) {
        setError('name', { message: 'Name must be at least 2 characters' });
        setLoading(false);
        return;
      }

      const authData = await signUp(data.email.trim().toLowerCase(), data.password, {
        fullName: safeName,
        role,
      });
      // Upsert role into user_profiles after signup
      if (authData?.user?.id) {
        await supabase.from('user_profiles').upsert({
          id: authData.user.id,
          email: data.email.trim().toLowerCase(),
          full_name: safeName,
          role,
        }, { onConflict: 'id' });
      }
      toast.success(`Welcome to EduAI, ${safeName.split(' ')[0]}! 🎉`);
      if (role === 'teacher') {
        router.push('/teacher-dashboard');
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (err: any) {
      const message = err?.message || 'Could not create account. Please try again.';
      setError('email', { message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <h2 className="text-2xl font-700 text-foreground mb-1">Create your account</h2>
      <p className="text-muted-foreground text-sm mb-5">Start learning with AI in your language</p>

      {/* Role Selection */}
      <div className="mb-5">
        <label className="block text-sm font-600 text-foreground mb-2">I am a...</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              role === 'student' ?'border-primary bg-primary/5 text-primary' :'border-border bg-muted text-muted-foreground hover:border-primary/40'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            <span className="text-sm font-600">Student</span>
            <span className="text-xs opacity-70">Learn & practice</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('teacher')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              role === 'teacher' ?'border-primary bg-primary/5 text-primary' :'border-border bg-muted text-muted-foreground hover:border-primary/40'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M9 21V9"/>
            </svg>
            <span className="text-sm font-600">Teacher</span>
            <span className="text-xs opacity-70">Create & manage</span>
          </button>
        </div>
      </div>

      {/* Google auth */}
      <button
        type="button"
        className="w-full flex items-center justify-center gap-3 border border-border rounded-xl py-2.5 text-sm font-500 text-foreground hover:bg-muted transition-colors btn-press mb-4"
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      <div className="flex items-center gap-3 mb-4">
        <hr className="flex-1 border-border" />
        <span className="text-xs text-muted-foreground font-500">or create with email</span>
        <hr className="flex-1 border-border" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-600 text-foreground mb-1">Full Name</label>
          <input
            type="text"
            {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })}
            placeholder="Your full name"
            className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-600 text-foreground mb-1">Email address</label>
          <input
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
            })}
            placeholder="you@example.com"
            className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-600 text-foreground mb-1">Password</label>
          <p className="text-xs text-muted-foreground mb-1.5">Minimum 8 characters with at least one number</p>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
                pattern: { value: /(?=.*[0-9])/, message: 'Password must contain at least one number' },
              })}
              placeholder="Create a strong password"
              className="w-full px-3 py-2.5 pr-10 text-sm bg-muted border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={18} />
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
        </div>

        {role === 'student' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-600 text-foreground mb-1">Grade</label>
              <select
                {...register('grade', { required: 'Select your grade' })}
                className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                {GRADES.map((g) => (
                  <option key={`signup-grade-${g}`} value={g}>Grade {g}</option>
                ))}
              </select>
              {errors.grade && <p className="text-xs text-red-600 mt-1">{errors.grade.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-600 text-foreground mb-1">Preferred Language</label>
              <select
                {...register('language')}
                className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                {LANGUAGES.map((l) => (
                  <option key={`signup-lang-${l.code}`} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {role === 'teacher' && (
          <div>
            <label className="block text-sm font-600 text-foreground mb-1">Preferred Language</label>
            <select
              {...register('language')}
              className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              {LANGUAGES.map((l) => (
                <option key={`signup-lang-teacher-${l.code}`} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              {...register('terms', { required: 'You must accept the terms to continue' })}
              className="w-4 h-4 mt-0.5 rounded border-border accent-primary shrink-0"
            />
            <span className="text-sm text-foreground leading-relaxed">
              I agree to the{' '}
              <button type="button" className="text-primary font-500 hover:underline">Terms of Service</button>
              {' '}and{' '}
              <button type="button" className="text-primary font-500 hover:underline">Privacy Policy</button>
            </span>
          </label>
          {errors.terms && <p className="text-xs text-red-600 mt-1">{errors.terms.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 gradient-indigo text-white font-600 text-sm rounded-xl hover:opacity-90 transition-opacity btn-press disabled:opacity-70"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating account...
            </>
          ) : (
            `Create ${role === 'teacher' ? 'Teacher' : 'Student'} Account`
          )}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-4">
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} className="text-primary font-600 hover:underline">
          Sign in
        </button>
      </p>
    </div>
  );
}