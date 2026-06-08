export interface ConversionResult {
  buffer: Buffer;
  mimeType: string;
  filename: string;
}

export interface TextConversionBody {
  text: string;
}

export interface ApiError {
  message: string;
  code?: string;
}
