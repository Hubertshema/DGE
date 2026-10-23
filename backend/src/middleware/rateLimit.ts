import { NextFunction, Request, Response } from 'express';

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export const rateLimit = (options: { windowMs: number; max: number; keyPrefix?: string }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${options.keyPrefix || 'global'}:${req.ip || req.socket.remoteAddress || 'unknown'}`;
    const now = Date.now();
    const existing = buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
      return next();
    }

    existing.count += 1;
    if (existing.count > options.max) {
      const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      return res.status(429).json({
        success: false,
        error: 'Too many attempts. Please wait a moment and try again.',
      });
    }

    return next();
  };
};

const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}, 5 * 60 * 1000);
if (typeof (cleanupTimer as any).unref === 'function') {
  (cleanupTimer as any).unref();
}

