import { Router, Request, Response, NextFunction } from 'express';
import { upload } from '../middleware/upload';
import { convertImageToPdf } from '../services/imageToPdf';
import { convertImageToWord } from '../services/imageToWord';
import { convertTextToPdf, convertTextToWord } from '../services/textToDocument';

const router = Router();

// ── Image → PDF ────────────────────────────────────────────────────────────
router.post(
  '/image-to-pdf',
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

      const pdf = await convertImageToPdf(req.file.buffer, req.file.mimetype);
      const filename = encodeURIComponent(req.file.originalname.replace(/\.[^.]+$/, '') + '.pdf');

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdf.length,
      });
      return res.send(pdf);
    } catch (err) {
      next(err);
    }
  },
);

// ── Image → Word (AI OCR) ───────────────────────────────────────────────────
router.post(
  '/image-to-word',
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

      const docx = await convertImageToWord(req.file.buffer);
      const filename = encodeURIComponent(req.file.originalname.replace(/\.[^.]+$/, '') + '.docx');

      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': docx.length,
      });
      return res.send(docx);
    } catch (err) {
      next(err);
    }
  },
);

// ── Text/Markdown → PDF ────────────────────────────────────────────────────
router.post('/text-to-pdf', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text } = req.body as { text?: string };
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ message: 'A non-empty "text" field is required.' });
    }

    const pdf = await convertTextToPdf(text);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="document.pdf"',
      'Content-Length': pdf.length,
    });
    return res.send(pdf);
  } catch (err) {
    next(err);
  }
});

// ── Text/Markdown → Word ───────────────────────────────────────────────────
router.post('/text-to-word', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text } = req.body as { text?: string };
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ message: 'A non-empty "text" field is required.' });
    }

    const docx = await convertTextToWord(text);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': 'attachment; filename="document.docx"',
      'Content-Length': docx.length,
    });
    return res.send(docx);
  } catch (err) {
    next(err);
  }
});

export default router;
