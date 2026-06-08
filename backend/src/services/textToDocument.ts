import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

const MARGIN = 50;
const CONTENT_WIDTH = 495; // A4 595pt minus 2×50 margins
const HEBREW_RE = /[֐-׿]/;

// ---------------------------------------------------------------------------
// Markdown-aware line parser (single-line, no AST needed)
// ---------------------------------------------------------------------------

type LineType = 'h1' | 'h2' | 'h3' | 'text' | 'empty';

interface ParsedLine {
  type: LineType;
  raw: string;
}

function parseLine(line: string): ParsedLine {
  if (!line.trim()) return { type: 'empty', raw: '' };
  if (line.startsWith('### ')) return { type: 'h3', raw: line.slice(4) };
  if (line.startsWith('## ')) return { type: 'h2', raw: line.slice(3) };
  if (line.startsWith('# ')) return { type: 'h1', raw: line.slice(2) };
  return { type: 'text', raw: line };
}

function stripInline(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1');
}

// ---------------------------------------------------------------------------
// Simple word-wrap for pdf-lib (no RTL — limitation of StandardFonts)
// ---------------------------------------------------------------------------

function wrapWords(
  text: string,
  font: { widthOfTextAtSize(t: string, s: number): number },
  size: number,
  maxWidth: number,
): string[] {
  if (!text.trim()) return [''];
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// ---------------------------------------------------------------------------
// Text → PDF
// ---------------------------------------------------------------------------

export async function convertTextToPdf(text: string): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage(PageSizes.A4);
  const pageH = page.getHeight();
  let y = pageH - MARGIN;

  const ensureSpace = (needed: number) => {
    if (y - needed < MARGIN) {
      page = pdfDoc.addPage(PageSizes.A4);
      y = page.getHeight() - MARGIN;
    }
  };

  const draw = (lineText: string, size: number, font: typeof regular, leading: number) => {
    ensureSpace(leading);
    page.drawText(lineText, { x: MARGIN, y, size, font, color: rgb(0.07, 0.07, 0.07) });
    y -= leading;
  };

  for (const raw of text.split('\n')) {
    const parsed = parseLine(raw);

    switch (parsed.type) {
      case 'h1':
        y -= 6;
        draw(stripInline(parsed.raw), 22, bold, 32);
        y -= 4;
        break;
      case 'h2':
        y -= 4;
        draw(stripInline(parsed.raw), 17, bold, 26);
        y -= 2;
        break;
      case 'h3':
        y -= 2;
        draw(stripInline(parsed.raw), 13, bold, 20);
        break;
      case 'empty':
        y -= 10;
        break;
      default: {
        const clean = stripInline(parsed.raw);
        for (const wrapped of wrapWords(clean, regular, 12, CONTENT_WIDTH)) {
          draw(wrapped, 12, regular, 18);
        }
      }
    }
  }

  return Buffer.from(await pdfDoc.save());
}

// ---------------------------------------------------------------------------
// Text → Word (full RTL support via docx)
// ---------------------------------------------------------------------------

interface TextSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
}

function parseInlineMarkdown(raw: string): TextSegment[] {
  const segments: TextSegment[] = [];
  // Match **bold** or *italic* runs
  const re = /(\*\*(.*?)\*\*|\*(.*?)\*)/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(raw)) !== null) {
    if (match.index > last) segments.push({ text: raw.slice(last, match.index) });
    if (match[0].startsWith('**')) {
      segments.push({ text: match[2], bold: true });
    } else {
      segments.push({ text: match[3], italic: true });
    }
    last = match.index + match[0].length;
  }
  if (last < raw.length) segments.push({ text: raw.slice(last) });
  return segments.length ? segments : [{ text: raw }];
}

export async function convertTextToWord(text: string): Promise<Buffer> {
  const paragraphs = text.split('\n').map((raw) => {
    const parsed = parseLine(raw);
    const isHebrew = HEBREW_RE.test(parsed.raw);
    const alignment = isHebrew ? AlignmentType.RIGHT : AlignmentType.LEFT;

    if (parsed.type === 'empty') {
      return new Paragraph({ children: [new TextRun('')] });
    }

    if (parsed.type === 'h1' || parsed.type === 'h2' || parsed.type === 'h3') {
      const headingLevel =
        parsed.type === 'h1' ? HeadingLevel.HEADING_1
        : parsed.type === 'h2' ? HeadingLevel.HEADING_2
        : HeadingLevel.HEADING_3;
      return new Paragraph({
        heading: headingLevel,
        alignment,
        bidirectional: isHebrew,
        children: [new TextRun({ text: parsed.raw, bold: true, rightToLeft: isHebrew })],
      });
    }

    const runs = parseInlineMarkdown(parsed.raw).map(
      (seg) =>
        new TextRun({
          text: seg.text,
          bold: seg.bold,
          italics: seg.italic,
          rightToLeft: isHebrew,
          font: isHebrew ? 'David' : 'Calibri',
          size: 24,
        }),
    );

    return new Paragraph({ alignment, bidirectional: isHebrew, children: runs });
  });

  const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
  return Packer.toBuffer(doc);
}
