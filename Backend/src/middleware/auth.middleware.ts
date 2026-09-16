import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors.js';

export function isAuthorized(req: Request, _res: Response, next: NextFunction): void {
  if (!req.session.user) {
    next(new AppError(401, 'Sign in before requesting a review.', 'UNAUTHORIZED'));
    return;
  }
  next();
}
