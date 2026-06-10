import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';

// pdf-parse v2 uses CommonJS exports; require avoids ESM interop issues
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (
  buf: Buffer,
) => Promise<{ text: string; numpages: number }>;

const HEBREW_RE = /[֐-׿]/;

export async function convertPdfToWord(pdfBuffer: Buffer): Promise<Buffer> {
  const data = await pdfParse(pdfBuffer);

  const lines: string[] = data.text.split('\n');

  const paragraphs = lines.map((line: string) => {
    const isHebrew = HEBREW_RE.test(line);
    return new Paragraph({
      alignment: isHebrew ? AlignmentType.RIGHT : AlignmentType.LEFT,
      bidirectional: isHebrew,
      children: [
        new TextRun({
          text: line || ' ',
          font: isHebrew ? 'David' : 'Calibri',
          size: 24,
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
