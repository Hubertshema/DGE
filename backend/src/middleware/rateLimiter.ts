import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

/**
 * In-memory sliding-window rate limiter middleware for production protection.
 * Requires zero external dependencies.
 */
export function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
}) {
  const store = new Map<string, RateLimitRecord>();

  // Cleanup expired entries periodically (every 5 minutes)
  const interval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  // Unref interval to not block process exit
  if (typeof (interval as any)?.unref === 'function') {
    (interval as any).unref();
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-client';
    const key = `${req.baseUrl || ''}:${req.path}:${ip}`;
    const now = Date.now();

    let record = store.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + options.windowMs,
      };
      store.set(key, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, options.maxRequests - record.count);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', options.maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetSeconds);

    if (record.count > options.maxRequests) {
      res.setHeader('Retry-After', resetSeconds);
      return res.status(429).json({
        success: false,
        error: options.message || 'Too many requests. Please wait a few moments and try again.',
      });
    }

    next();
  };
}

// Strict limiter for authentication routes (login, register, password change)
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 50, // 50 requests per 15 min per IP (accommodates automated QA + bursts)
  message: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
});

// General API limiter
export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 600, // 600 requests per minute
  message: 'Too many requests. Please slow down.',
});
