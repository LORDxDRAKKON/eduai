import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/security/rateLimiter';
import { securityLogger } from '@/lib/security/logger';
import { isValidEmail, isValidPassword } from '@/lib/security/validation';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/auth/login
 * Server-side login with rate limiting and logging.
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const path = '/api/auth/login';

  // Rate limit: 10 attempts per 15 minutes per IP
  const rateResult = checkRateLimit(`login:${ip}`, RATE_LIMITS.login);
  if (!rateResult.allowed) {
    securityLogger.rateLimitHit({ ip, path, limitType: 'login' });
    return NextResponse.json(
      { error: 'Too many login attempts. Please wait before trying again.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rateResult.resetAt - Date.now()) / 1000)) },
      }
    );
  }

  let email = '';
  try {
    const body = await request.json();
    email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    // Input validation
    if (!isValidEmail(email)) {
      securityLogger.authAttempt({ ip, email, success: false, reason: 'Invalid email format' });
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const pwCheck = isValidPassword(password);
    if (!pwCheck.valid) {
      return NextResponse.json({ error: pwCheck.reason }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      securityLogger.authAttempt({ ip, email, success: false, reason: error?.message });
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Fetch role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    securityLogger.authAttempt({ ip, email, success: true });
    return NextResponse.json({ user: data.user, role: profile?.role || 'student' });
  } catch (err: any) {
    securityLogger.apiError({ path, statusCode: 500, message: err?.message || 'Login error', ip });
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
