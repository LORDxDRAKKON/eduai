import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { securityLogger } from '@/lib/security/logger';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/security/rateLimiter';

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  // Rate limit the callback endpoint to prevent abuse
  const rateResult = checkRateLimit(`callback:${ip}`, RATE_LIMITS.login);
  if (!rateResult.allowed) {
    securityLogger.rateLimitHit({ ip, path: '/auth/callback', limitType: 'login' });
    return NextResponse.redirect(`${origin}/sign-up-login-screen?error=rate_limited`);
  }

  // Validate the 'next' redirect to prevent open redirect attacks
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      securityLogger.authAttempt({ ip, email: data.user.email || 'unknown', success: true });
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
    securityLogger.authAttempt({ ip, email: 'unknown', success: false, reason: error?.message });
  }

  return NextResponse.redirect(`${origin}/sign-up-login-screen`);
}
