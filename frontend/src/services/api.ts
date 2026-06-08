import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
  timeout: 30_000,
});

async function extractError(error: unknown): Promise<never> {
  if (axios.isAxiosError(error)) {
    // When responseType:'blob', error body arrives as a Blob
    if (error.response?.data instanceof Blob) {
      try {
        const text = await (error.response.data as Blob).text();
        const json = JSON.parse(text) as { message?: string };
        throw new Error(json.message ?? 'Conversion failed');
      } catch (inner) {
        if (inner instanceof Error) throw inner;
      }
    }
    const msg = (error.response?.data as { message?: string })?.message;
    throw new Error(msg ?? error.message ?? 'Network error');
  }
  throw error;
}

export async function convertImageToPdf(file: File): Promise<Blob> {
  const form = new FormData();
  form.append('file', file);
  try {
    const { data } = await api.post<Blob>('/api/convert/image-to-pdf', form, {
      responseType: 'blob',
    });
    return data;
  } catch (err) {
    return extractError(err);
  }
}

export async function convertImageToWord(file: File): Promise<Blob> {
  const form = new FormData();
  form.append('file', file);
  try {
    const { data } = await api.post<Blob>('/api/convert/image-to-word', form, {
      responseType: 'blob',
      timeout: 90_000, // OCR can take a while
    });
    return data;
  } catch (err) {
    return extractError(err);
  }
}

export async function convertTextToPdf(text: string): Promise<Blob> {
  try {
    const { data } = await api.post<Blob>('/api/convert/text-to-pdf', { text }, {
      responseType: 'blob',
    });
    return data;
  } catch (err) {
    return extractError(err);
  }
}

export async function convertTextToWord(text: string): Promise<Blob> {
  try {
    const { data } = await api.post<Blob>('/api/convert/text-to-word', { text }, {
      responseType: 'blob',
    });
    return data;
  } catch (err) {
    return extractError(err);
  }
}
