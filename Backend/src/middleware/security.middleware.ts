import type { NextFunction, Request, Response } from 'express';
import { config } from '../config.js';
import { AppError } from '../errors.js';

export function requireSameOrigin(req: Request, _res: Response, next: NextFunction): void {
  const origin = req.get('origin');
  if (!origin) {
    if (config.isProduction) return next(new AppError(403, 'A same-origin request is required.', 'CSRF_REJECTED'));
    return next();
  }
  const requestOrigin = origin.replace(/\/$/, '');
  const ownOrigin = `${req.protocol}://${req.get('host')}`.replace(/\/$/, '');
  if (requestOrigin !== ownOrigin && !config.frontendOrigins.includes(requestOrigin)) {
    return next(new AppError(403, 'Request origin is not trusted.', 'CSRF_REJECTED'));
  }
  next();
}

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(limit: number, windowMs = 60_000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    const key = `${req.ip}:${req.path}`;
    const current = buckets.get(key);
    const bucket = !current || current.resetAt <= now ? { count: 0, resetAt: now + windowMs } : current;
    bucket.count += 1;
    buckets.set(key, bucket);
    res.setHeader('RateLimit-Limit', limit);
    res.setHeader('RateLimit-Remaining', Math.max(0, limit - bucket.count));
    if (bucket.count > limit) {
      res.setHeader('Retry-After', Math.ceil((bucket.resetAt - now) / 1000));
      next(new AppError(429, 'Too many requests. Please try again shortly.', 'RATE_LIMITED'));
      return;
    }
    next();
  };
}
