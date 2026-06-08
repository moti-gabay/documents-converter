import OpenAI from 'openai';
import sharp from 'sharp';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import dotenv from "dotenv"
dotenv.config();


const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const HEBREW_RE = /[֐-׿]/;
const MAX_DIMENSION = 1500;

const SYSTEM_PROMPT = `You are a precision OCR engine. Extract ALL text from the provided image.

Rules:
- Preserve original line breaks and paragraph structure exactly.
- Output Hebrew characters correctly in their proper Unicode form.
- Output English characters correctly.
- Preserve mixed Hebrew/English lines as they appear.
- Do NOT translate, summarise, or add any commentary.
- Return ONLY the extracted text, nothing else.`;

async function resizeForApi(buffer: Buffer): Promise<{ data: string; mimeType: 'image/jpeg' }> {
  const resized = await sharp(buffer)
    .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 90 })
    .toBuffer();
  return { data: resized.toString('base64'), mimeType: 'image/jpeg' };
}

export async function convertImageToWord(imageBuffer: Buffer): Promise<Buffer> {
  const { data, mimeType } = await resizeForApi(imageBuffer);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 4096,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${data}`, detail: 'high' } },
          { type: 'text', text: 'Extract all text from this image.' },
        ],
      },
    ],
  });

  const extractedText = response.choices[0]?.message?.content?.trim() ?? '';

  const paragraphs = extractedText.split('\n').map((line) => {
    const isHebrew = HEBREW_RE.test(line);
    return new Paragraph({
      alignment: isHebrew ? AlignmentType.RIGHT : AlignmentType.LEFT,
      bidirectional: isHebrew,
      children: [
        new TextRun({
          text: line || ' ',
          font: isHebrew ? 'David' : 'Calibri',
          size: 24, // 12 pt
          rightToLeft: isHebrew,
        }),
      ],
    });
  });

  const doc = new Document({
    sections: [{ properties: {}, children: paragraphs }],
  });

  return Packer.toBuffer(doc);
}
