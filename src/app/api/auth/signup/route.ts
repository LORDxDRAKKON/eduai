import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/security/rateLimiter';
import { securityLogger } from '@/lib/security/logger';
import { isValidEmail, isValidPassword } from '@/lib/security/validation';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/auth/signup
 * Server-side signup with rate limiting and logging.
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const path = '/api/auth/signup';

  // Rate limit: 5 signups per hour per IP
  const rateResult = checkRateLimit(`signup:${ip}`, RATE_LIMITS.signup);
  if (!rateResult.allowed) {
    securityLogger.rateLimitHit({ ip, path, limitType: 'signup' });
    return NextResponse.json(
      { error: 'Too many signup attempts. Please try again later.' },
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
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim().slice(0, 100) : '';
    const role = body.role === 'teacher' ? 'teacher' : 'student';

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const pwCheck = isValidPassword(password);
    if (!pwCheck.valid) {
      return NextResponse.json({ error: pwCheck.reason }, { status: 400 });
    }

    if (!fullName || fullName.length < 2) {
      return NextResponse.json({ error: 'Full name must be at least 2 characters' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (error) {
      securityLogger.signupAttempt({ ip, email, success: false, reason: error.message });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (data.user) {
      await supabase.from('user_profiles').upsert(
        { id: data.user.id, email, full_name: fullName, role },
        { onConflict: 'id' }
      );
    }

    securityLogger.signupAttempt({ ip, email, success: true });
    return NextResponse.json({ user: data.user, role });
  } catch (err: any) {
    securityLogger.apiError({ path, statusCode: 500, message: err?.message || 'Signup error', ip });
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}
