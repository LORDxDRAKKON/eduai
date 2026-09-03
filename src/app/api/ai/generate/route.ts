import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/security/rateLimiter';
import { securityLogger } from '@/lib/security/logger';
import { validateTextField } from '@/lib/security/validation';
import { createClient } from '@/lib/supabase/server';
import { generateTutorResponse } from '@/lib/ai/templateEngine';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const path = '/api/ai/generate';
  let body: any = {};

  // 1. Rate limiting
  const rateResult = checkRateLimit(`ai:${ip}`, RATE_LIMITS.aiGeneration);
  if (!rateResult.allowed) {
    securityLogger.rateLimitHit({ ip, path, limitType: 'aiGeneration' });
    return NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rateResult.resetAt - Date.now()) / 1000)) },
      }
    );
  }

  // 2. Auth check
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      securityLogger.unauthorizedAccess({ ip, path, reason: 'Unauthenticated AI request' });
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: 'Authentication check failed' }, { status: 401 });
  }

  try {
    body = await request.json();
    const { messages } = body;

    // 3. Validate messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages must be a non-empty array' }, { status: 400 });
    }

    for (const msg of messages) {
      if (!msg?.role || !msg?.content) {
        return NextResponse.json({ error: 'Each message must have role and content' }, { status: 400 });
      }
      const contentCheck = validateTextField(msg.content, 'message content', { maxLength: 10000 });
      if (!contentCheck.valid) {
        securityLogger.suspiciousInput({ ip, path, field: 'message.content', reason: contentCheck.reason || 'invalid' });
        return NextResponse.json({ error: contentCheck.reason }, { status: 400 });
      }
    }

    // 4. Generate response using template engine (no external API calls)
    const lastUserMessage = [...messages].reverse().find((m: any) => m.role === 'user');
    const userContent = lastUserMessage?.content || '';
    const responseText = generateTutorResponse(userContent);

    return NextResponse.json({
      choices: [
        {
          message: {
            role: 'assistant',
            content: responseText,
          },
          finish_reason: 'stop',
        },
      ],
    });
  } catch (error) {
    securityLogger.apiError({ path, statusCode: 500, message: String(error), ip });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
