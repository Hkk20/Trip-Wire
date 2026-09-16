import { Router } from 'express';
import { demoLogin, getSession, logout } from '../controllers/auth.controller.js';
import { handlePRAnalysis } from '../controllers/review.controller.js';
import { isAuthorized } from '../middleware/auth.middleware.js';
import { rateLimit, requireSameOrigin } from '../middleware/security.middleware.js';

export const apiRouter = Router();
apiRouter.get('/health', (_req, res) => res.status(200).json({ success: true, status: 'online' }));
apiRouter.get('/auth/session', getSession);
apiRouter.post('/auth/demo-login', requireSameOrigin, rateLimit(10), demoLogin);
apiRouter.delete('/auth/session', requireSameOrigin, isAuthorized, logout);
apiRouter.post('/reviews/analyze', requireSameOrigin, rateLimit(10), isAuthorized, handlePRAnalysis);
