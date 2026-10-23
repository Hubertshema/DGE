import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export type AsyncRoute = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export const asyncHandler = (fn: AsyncRoute) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'HttpError';
  }
}

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Please check the submitted information.',
      details: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ success: false, error: err.message });
  }

  if (err && typeof err === 'object' && 'code' in err && (err as any).code === '23505') {
    return res.status(409).json({ success: false, error: 'That record already exists.' });
  }

  console.error('Unhandled server error:', err);
  return res.status(500).json({
    success: false,
    error: 'An unexpected internal error occurred.',
  });
};
