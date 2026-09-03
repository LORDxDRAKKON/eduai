/**
 * Server-side security logger.
 * Logs auth attempts, API errors, and suspicious patterns.
 * All logs go to stdout (captured by hosting platform).
 */

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
  level: LogLevel;
  event: string;
  ip?: string;
  userId?: string;
  email?: string;
  path?: string;
  statusCode?: number;
  message?: string;
  timestamp: string;
}

function log(entry: Omit<LogEntry, 'timestamp'>) {
  const record: LogEntry = { ...entry, timestamp: new Date().toISOString() };
  // Structured JSON log — easy to parse by log aggregators
  console.log(JSON.stringify(record));
}

export const securityLogger = {
  authAttempt(params: { ip: string; email: string; success: boolean; reason?: string }) {
    log({
      level: params.success ? 'INFO' : 'WARN',
      event: params.success ? 'AUTH_SUCCESS' : 'AUTH_FAILURE',
      ip: params.ip,
      email: params.email,
      message: params.reason,
    });
  },

  rateLimitHit(params: { ip: string; path: string; limitType: string }) {
    log({
      level: 'WARN',
      event: 'RATE_LIMIT_HIT',
      ip: params.ip,
      path: params.path,
      message: `Rate limit exceeded for ${params.limitType}`,
    });
  },

  apiError(params: { path: string; statusCode: number; message: string; userId?: string; ip?: string }) {
    log({
      level: 'ERROR',
      event: 'API_ERROR',
      path: params.path,
      statusCode: params.statusCode,
      userId: params.userId,
      ip: params.ip,
      message: params.message,
    });
  },

  suspiciousInput(params: { ip: string; path: string; field: string; reason: string }) {
    log({
      level: 'WARN',
      event: 'SUSPICIOUS_INPUT',
      ip: params.ip,
      path: params.path,
      message: `Field "${params.field}": ${params.reason}`,
    });
  },

  signupAttempt(params: { ip: string; email: string; success: boolean; reason?: string }) {
    log({
      level: params.success ? 'INFO' : 'WARN',
      event: params.success ? 'SIGNUP_SUCCESS' : 'SIGNUP_FAILURE',
      ip: params.ip,
      email: params.email,
      message: params.reason,
    });
  },

  unauthorizedAccess(params: { ip: string; path: string; userId?: string; reason: string }) {
    log({
      level: 'WARN',
      event: 'UNAUTHORIZED_ACCESS',
      ip: params.ip,
      path: params.path,
      userId: params.userId,
      message: params.reason,
    });
  },
};
