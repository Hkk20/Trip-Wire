import type { Request, Response } from 'express';
import { config } from '../config.js';
import { AppError } from '../errors.js';

export function demoLogin(req: Request, res: Response): void {
  if (config.isProduction) throw new AppError(404, 'Not found.', 'NOT_FOUND');
  const username = typeof req.body?.username === 'string' ? req.body.username.trim().slice(0, 64) : config.demoUser;
  if (!username) throw new AppError(400, 'A display name is required.', 'INVALID_USERNAME');
  req.session.regenerate((error) => {
    if (error) { res.status(500).json({ success: false, error: 'SESSION_ERROR', message: 'Could not create a session.' }); return; }
    req.session.user = { id: `demo:${username.toLowerCase()}`, username };
    req.session.save((saveError) => {
      if (saveError) { res.status(500).json({ success: false, error: 'SESSION_ERROR', message: 'Could not save the session.' }); return; }
      res.status(200).json({ success: true, data: { user: req.session.user, demo: true } });
    });
  });
}
export function getSession(req: Request, res: Response): void { res.status(200).json({ success: true, data: { user: req.session.user ?? null, demo: !config.isProduction } }); }
export function logout(req: Request, res: Response): void {
  req.session.destroy(() => { res.clearCookie(config.isProduction ? '__Host-tripwire.sid' : 'tripwire.sid'); res.status(204).send(); });
}
