'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

interface LoginValues {
  email: string;
  password: string;
  remember: boolean;
}

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

export default function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginValues>();

  const onSubmit = async (data: LoginValues) => {
    setLoading(true);
    try {
      const authData = await signIn(data.email, data.password);
      // Fetch role from user_profiles
      let role = 'student';
      if (authData?.user?.id) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single();
        if (profile?.role) role = profile.role;
      }
      toast.success('Welcome back! 👋');
      if (role === 'teacher') {
        router.push('/teacher-dashboard');
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (err: any) {
      const message = err?.message || 'Invalid email or password';
      setError('email', { message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <h2 className="text-2xl font-700 text-foreground mb-1">Welcome back</h2>
      <p className="text-muted-foreground text-sm mb-6">Sign in to continue your learning journey</p>

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
        <span className="text-xs text-muted-foreground font-500">or sign in with email</span>
        <hr className="flex-1 border-border" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password', { required: 'Password is required' })}
              placeholder="Enter your password"
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

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('remember')}
              className="w-4 h-4 rounded border-border accent-primary"
            />
            <span className="text-sm text-foreground">Remember me</span>
          </label>
          <button type="button" className="text-sm text-primary font-500 hover:underline">
            Forgot password?
          </button>
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
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Demo credentials */}
      <div className="mt-6 border border-primary/20 rounded-xl p-4 bg-secondary">
        <p className="text-xs font-700 text-secondary-foreground uppercase tracking-wide mb-2">Demo Account</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between bg-card rounded-lg px-3 py-1.5">
            <span className="text-xs text-muted-foreground">Email: </span>
            <span className="text-xs font-500 text-foreground font-mono">demo@eduai.in</span>
          </div>
          <div className="flex items-center justify-between bg-card rounded-lg px-3 py-1.5">
            <span className="text-xs text-muted-foreground">Password: </span>
            <span className="text-xs font-500 text-foreground font-mono">EduAI@2024</span>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-4">
        Don&apos;t have an account?{' '}
        <button onClick={onSwitchToSignup} className="text-primary font-600 hover:underline">
          Sign up free
        </button>
      </p>
    </div>
  );
}