import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import convertRouter from './routes/convert';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT ?? 3001);
const IS_PROD = process.env.NODE_ENV === 'production';

// In dev, allow the Vite dev server origin. In prod, same-origin (no CORS needed).
if (!IS_PROD) {
  app.use(
    cors({
      origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
      credentials: true,
    }),
  );
}

app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/convert', convertRouter);

// Global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE' ? 'File exceeds the 10 MB limit.' : err.message;
    return res.status(400).json({ message });
  }
  console.error('[Error]', err.message);
  return res.status(err.status ?? 500).json({ message: err.message || 'Internal server error' });
});

// Serve React frontend in production
// __dirname = backend/dist, so frontend/dist is two levels up
if (IS_PROD) {
  const frontendDist = path.join(__dirname, '../../frontend/dist');
  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(frontendDist, 'index.html'));
    });
  }
}

app.listen(PORT, () => {
  console.log(`✓ Server running at http://localhost:${PORT}`);
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠  OPENAI_API_KEY is not set — image-to-word (OCR) will fail.');
  }
});
