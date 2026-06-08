import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

export async function convertImageToPdf(imageBuffer: Buffer, mimeType: string): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();

  // Normalise to PNG for universal pdf-lib compatibility
  const isJpeg = mimeType === 'image/jpeg' || mimeType === 'image/jpg';

  let embedBuffer = imageBuffer;
  if (!isJpeg) {
    embedBuffer = await sharp(imageBuffer).png().toBuffer();
  }

  const metadata = await sharp(embedBuffer).metadata();
  const width = metadata.width ?? 800;
  const height = metadata.height ?? 600;

  const page = pdfDoc.addPage([width, height]);

  const image = isJpeg
    ? await pdfDoc.embedJpg(embedBuffer)
    : await pdfDoc.embedPng(embedBuffer);

  page.drawImage(image, { x: 0, y: 0, width, height });

  return Buffer.from(await pdfDoc.save());
}
