import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
// import photoRoutes from './routes/photoRoutes.js';
// import momentRoutes from './routes/momentRoutes.js';
// import contentRoutes from './routes/contentRoutes.js';
import timerRoutes from './routes/timerRoutes.js';

import { notFound, errorHandler } from './middleware/error.js';
import cookieParser from 'cookie-parser';


export function createApp() {
  const app = express();
  if (process.env.TRUST_PROXY && process.env.TRUST_PROXY !== '0') app.set('trust proxy', Number(process.env.TRUST_PROXY) || 1);

  const origins = (process.env.CLIENT_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean);

  // rate limiter is in the middleware 

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }));
  app.use(cors({ origin: origins.length ? origins : false, credentials: true }));
  console.log('CORS allowed origins:', origins);
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is alive' });
  });
  // app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/auth', authRoutes);
  // app.use('/api/photos', photoRoutes);
  // app.use('/api/moments', momentRoutes);
  // app.use('/api/content', contentRoutes);
  app.use('/api/timer', timerRoutes);   // put this before your other app.use('/api/...') lines
  app.use('/api', notFound);

  // Optional one-host deploy: serve the built frontend (client/dist) and fall back to index.html for SPA routes.
  const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../client/dist');
  if (fs.existsSync(dist)) {
    app.use(express.static(dist));
    app.get('/{*splat}', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
  }

  app.use(errorHandler);
  return app;
}
