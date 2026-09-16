import type { NextFunction, Request, Response } from 'express';

export class AppError extends Error {
  constructor(public readonly statusCode: number, message: string, public readonly code = 'REQUEST_FAILED') {
    super(message);
    this.name = 'AppError';
  }
}

export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, `Route ${req.method} ${req.path} was not found.`, 'NOT_FOUND'));
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  const known = error instanceof AppError;
  const statusCode = known ? error.statusCode : 500;
  if (!known) console.error('Unhandled API error:', error);
  res.status(statusCode).json({
    success: false,
    error: known ? error.code : 'INTERNAL_ERROR',
    message: known && statusCode < 500 ? error.message : 'The request could not be completed.',
  });
}
