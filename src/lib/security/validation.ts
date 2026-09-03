/**
 * Input validation and sanitization utilities.
 * Prevents XSS, SQL injection, and command injection.
 */

/** Strip HTML tags and dangerous characters to prevent XSS */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // strip angle brackets (HTML tags)
    .replace(/javascript:/gi, '') // strip JS protocol
    .replace(/on\w+\s*=/gi, '') // strip inline event handlers
    .trim();
}

/** Validate email format */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

/** Validate password strength */
export function isValidPassword(password: string): { valid: boolean; reason?: string } {
  if (password.length < 8) return { valid: false, reason: 'Password must be at least 8 characters' };
  if (password.length > 128) return { valid: false, reason: 'Password too long' };
  if (!/[0-9]/.test(password)) return { valid: false, reason: 'Password must contain at least one number' };
  return { valid: true };
}

/** Detect SQL injection patterns */
export function hasSqlInjection(input: string): boolean {
  const patterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|TRUNCATE)\b)/i,
    /(--|;|\/\*|\*\/)/,
    /(\bOR\b|\bAND\b)\s+[\w'"]+=[\w'"]+/i,
    /'\s*(OR|AND)\s*'?\d/i,
  ];
  return patterns.some((p) => p.test(input));
}

/** Detect script injection patterns */
export function hasScriptInjection(input: string): boolean {
  const patterns = [
    /<script[\s>]/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\s*\(/i,
    /document\.(cookie|write|location)/i,
  ];
  return patterns.some((p) => p.test(input));
}

/** Validate and sanitize a free-text field (topic, message, etc.) */
export function validateTextField(
  value: unknown,
  fieldName: string,
  options: { maxLength?: number; minLength?: number } = {}
): { valid: boolean; sanitized: string; reason?: string } {
  if (typeof value !== 'string') {
    return { valid: false, sanitized: '', reason: `${fieldName} must be a string` };
  }

  const { maxLength = 2000, minLength = 1 } = options;

  if (value.trim().length < minLength) {
    return { valid: false, sanitized: '', reason: `${fieldName} is required` };
  }

  if (value.length > maxLength) {
    return { valid: false, sanitized: '', reason: `${fieldName} exceeds maximum length of ${maxLength}` };
  }

  if (hasSqlInjection(value)) {
    return { valid: false, sanitized: '', reason: `${fieldName} contains invalid characters` };
  }

  if (hasScriptInjection(value)) {
    return { valid: false, sanitized: '', reason: `${fieldName} contains invalid content` };
  }

  return { valid: true, sanitized: sanitizeString(value) };
}

/** Validate an enum value against an allowed list */
export function validateEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fieldName: string
): { valid: boolean; value?: T; reason?: string } {
  if (typeof value !== 'string' || !allowed.includes(value as T)) {
    return { valid: false, reason: `${fieldName} must be one of: ${allowed.join(', ')}` };
  }
  return { valid: true, value: value as T };
}

/** Allowed AI providers */
export const ALLOWED_PROVIDERS = ['PERPLEXITY', 'OPEN_AI', 'GEMINI', 'ANTHROPIC'] as const;

/** Allowed AI models (whitelist) */
export const ALLOWED_MODELS = [
  'perplexity/sonar-pro',
  'perplexity/sonar',
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4-turbo',
  'claude-3-5-sonnet-20241022',
  'claude-3-haiku-20240307',
  'gemini-2.0-flash-exp',
  'gemini-1.5-pro',
] as const;
