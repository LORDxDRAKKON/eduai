import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/security/rateLimiter';
import { securityLogger } from '@/lib/security/logger';
import { validateEnum, validateTextField, ALLOWED_PROVIDERS, ALLOWED_MODELS } from '@/lib/security/validation';
import { createClient } from '@/lib/supabase/server';
import { completion } from '@rocketnew/llm-sdk';

const API_KEYS: Record<string, string | undefined> = {
  OPEN_AI: process.env.OPENAI_API_KEY,
  ANTHROPIC: process.env.ANTHROPIC_API_KEY,
  GEMINI: process.env.GEMINI_API_KEY,
  PERPLEXITY: process.env.PERPLEXITY_API_KEY,
};

function formatErrorResponse(error: unknown, provider?: string) {
  const statusCode = (error as any)?.statusCode || (error as any)?.status || 500;
  const providerName = (error as any)?.llmProvider || provider || 'Unknown';
  return {
    error: `${providerName.toUpperCase()} API error: ${statusCode}`,
    details: error instanceof Error ? error.message : String(error),
    statusCode,
  };
}

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
    const { provider, model, messages, stream = false, parameters = {} } = body;

    // 3. Validate provider
    const providerValidation = validateEnum(provider, ALLOWED_PROVIDERS, 'provider');
    if (!providerValidation.valid) {
      return NextResponse.json({ error: providerValidation.reason }, { status: 400 });
    }

    // 4. Validate model
    const modelValidation = validateEnum(model, ALLOWED_MODELS, 'model');
    if (!modelValidation.valid) {
      return NextResponse.json({ error: modelValidation.reason }, { status: 400 });
    }

    // 5. Validate messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages must be a non-empty array' }, { status: 400 });
    }
    if (messages.length > 50) {
      return NextResponse.json({ error: 'Too many messages (max 50)' }, { status: 400 });
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

    // 6. Sanitize parameters
    const safeParameters: Record<string, unknown> = {};
    if (typeof parameters.max_tokens === 'number') safeParameters.max_tokens = Math.min(parameters.max_tokens, 4000);
    if (typeof parameters.temperature === 'number') safeParameters.temperature = Math.max(0, Math.min(2, parameters.temperature));

    const apiKey = API_KEYS[provider];
    if (!apiKey) {
      return NextResponse.json(
        { error: `${provider.toUpperCase()} API key is not configured` },
        { status: 400 }
      );
    }

    if (stream) {
      const response = await completion({ model, messages, stream: true, api_key: apiKey, ...safeParameters });
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'start' })}\n\n`));
            for await (const chunk of response as unknown as AsyncIterable<unknown>) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'chunk', chunk })}\n\n`));
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
            controller.close();
          } catch (error) {
            const formatted = formatErrorResponse(error, provider);
            securityLogger.apiError({ path, statusCode: formatted.statusCode, message: formatted.details, ip });
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: formatted.error })}\n\n`));
            controller.close();
          }
        },
      });
      return new NextResponse(readable, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
      });
    }

    const response = await completion({ model, messages, stream: false, api_key: apiKey, ...safeParameters });
    return NextResponse.json(response);
  } catch (error) {
    const formatted = formatErrorResponse(error, body?.provider);
    securityLogger.apiError({ path, statusCode: formatted.statusCode, message: formatted.details, ip });
    return NextResponse.json({ error: formatted.error, details: formatted.details }, { status: formatted.statusCode });
  }
}
