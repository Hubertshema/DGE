import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodTypeAny } from 'zod';

export const validateBody = (schema: ZodTypeAny) => (req: Request, _res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return next(result.error);
  }
  req.body = result.data;
  return next();
};

export const validateQuery = (schema: AnyZodObject) => (req: Request, _res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    return next(result.error);
  }
  (req as any).validatedQuery = result.data;
  return next();
};
