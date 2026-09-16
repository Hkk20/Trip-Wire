import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import { config } from './config.js';
import { errorHandler, notFound } from './errors.js';
import { apiRouter } from './routes/api.routes.js';

const app = express();
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const frontendDirectory = path.resolve(currentDirectory, '../../Frontend');
app.disable('x-powered-by');
app.set('trust proxy', config.trustProxy);
app.use(helmet({ contentSecurityPolicy: { directives: {
  defaultSrc: ["'self'"], scriptSrc: ["'self'", "'unsafe-inline'"], styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", 'data:'], connectSrc: ["'self'"],
} }, crossOriginResourcePolicy: { policy: 'same-origin' }, referrerPolicy: { policy: 'no-referrer' } }));
app.use(cors({ origin: config.frontendOrigins.length ? config.frontendOrigins : false, credentials: true, methods: ['GET', 'POST', 'DELETE'], maxAge: 600 }));
app.use(express.json({ limit: '32kb', type: 'application/json' }));
app.use(express.urlencoded({ extended: false, limit: '8kb' }));
app.use(session({
  name: config.isProduction ? '__Host-tripwire.sid' : 'tripwire.sid', secret: config.sessionSecret,
  resave: false, saveUninitialized: false,
  cookie: { httpOnly: true, secure: config.isProduction, sameSite: 'lax', maxAge: 60 * 60 * 1000, path: '/' },
}));
app.use('/api/v1', apiRouter);
app.use(express.static(frontendDirectory, { index: 'index.html', maxAge: config.isProduction ? '1h' : 0, etag: true }));
app.use(notFound);
app.use(errorHandler);
app.listen(config.port, () => console.info(`Tripwire API and frontend available at http://localhost:${config.port}`));
