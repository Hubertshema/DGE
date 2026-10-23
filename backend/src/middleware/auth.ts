import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export type UserRole = 'customer' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthUser;
    if (payload.role !== 'customer' && payload.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Invalid account role.' });
    }
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ success: false, error: 'Your session has expired. Please sign in again.' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: this action requires the DG administrator account.',
    });
  }
  return next();
};

export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthUser;
    if (payload.role === 'customer' || payload.role === 'admin') {
      req.user = payload;
    }
  } catch {
    // Continue unauthenticated if token is invalid or expired
  }
  return next();
};

