# Document Converter

A full-stack application for converting images and text into PDF or Word documents, with AI-powered OCR supporting Hebrew and English.

---

## Features

- **Image → PDF** — wraps any JPG or PNG into a properly sized PDF page
- **Image → Word (OCR)** — extracts text from images using GPT-4o Vision, outputs an editable `.docx` with full Hebrew RTL support
- **Text / Markdown → PDF** — renders plain text or Markdown (headings, bold, italic) as a PDF
- **Text / Markdown → Word** — converts Markdown to a structured `.docx` with RTL detection per paragraph
- Drag & drop file upload with image preview
- File validation (type and size) on both client and server
- Live loading states during OCR processing
- Instant file download on completion

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend runtime | Node.js 22 + TypeScript |
| Backend framework | Express 4 |
| File uploads | Multer (memory storage) |
| Image processing | Sharp |
| PDF generation | pdf-lib |
| Word generation | docx |
| OCR | OpenAI GPT-4o Vision API |
| Frontend | React 18 + TypeScript |
| Frontend build | Vite 5 |
| Drag & Drop | react-dropzone |
| HTTP client | Axios |

---

## Project Structure

```
documents-converter/
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   │   └── upload.ts          # Multer config (10 MB, JPG/PNG only)
│   │   ├── routes/
│   │   │   └── convert.ts         # All four POST endpoints
│   │   ├── services/
│   │   │   ├── imageToPdf.ts      # Image → PDF via pdf-lib
│   │   │   ├── imageToWord.ts     # Image → .docx via GPT-4o OCR
│   │   │   └── textToDocument.ts  # Text/Markdown → PDF & .docx
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts               # Express server entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── DropZone.tsx        # Drag & drop with preview
    │   │   ├── FormatSelector.tsx  # PDF / Word tab selector
    │   │   ├── ModeSelector.tsx    # Image / Text mode tabs
    │   │   └── StatusMessage.tsx   # Loading, success, error states
    │   ├── services/
    │   │   └── api.ts              # Axios API calls with error handling
    │   ├── types/
    │   │   └── index.ts
    │   ├── App.tsx
    │   ├── App.css
    │   ├── index.css
    │   └── main.tsx
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- An [OpenAI API key](https://platform.openai.com/api-keys) (required only for Image → Word OCR)

### 1. Clone or navigate to the project

```bash
cd ~/documents-converter
```

### 2. Set up the backend

```bash
cd backend
cp .env.example .env
```

Open `.env` and add your OpenAI key:

```env
PORT=3001
FRONTEND_URL=http://localhost:5173
OPENAI_API_KEY=sk-your-key-here
```

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

The backend will be available at `http://localhost:3001`.

### 3. Set up the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## API Reference

All endpoints are under `/api/convert`.

### `POST /api/convert/image-to-pdf`

Converts a JPG or PNG image into a PDF with matching page dimensions.

| | |
|---|---|
| Content-Type | `multipart/form-data` |
| Field | `file` (image/jpeg or image/png, max 10 MB) |
| Response | `application/pdf` binary |

### `POST /api/convert/image-to-word`

Sends the image to GPT-4o Vision to extract text, then builds a `.docx` file with proper Hebrew RTL alignment.

| | |
|---|---|
| Content-Type | `multipart/form-data` |
| Field | `file` (image/jpeg or image/png, max 10 MB) |
| Response | `.docx` binary |

> Images are automatically downscaled to a maximum of 1500×1500 px before sending to the API to reduce cost and latency.

### `POST /api/convert/text-to-pdf`

Renders plain text or Markdown as a PDF document.

| | |
|---|---|
| Content-Type | `application/json` |
| Body | `{ "text": "# Heading\n**bold** text..." }` |
| Response | `application/pdf` binary |

**Supported Markdown:** `# H1`, `## H2`, `### H3`, `**bold**`, `*italic*`

### `POST /api/convert/text-to-word`

Converts text or Markdown to a `.docx` file with heading styles, bold/italic runs, and automatic Hebrew RTL detection per paragraph.

| | |
|---|---|
| Content-Type | `application/json` |
| Body | `{ "text": "# Heading\n**bold** text..." }` |
| Response | `.docx` binary |

### `GET /health`

Returns `{ "status": "ok", "timestamp": "..." }`. Use for uptime checks.

---

## Environment Variables

### Backend (`.env`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Port the Express server listens on |
| `FRONTEND_URL` | `http://localhost:5173` | Allowed CORS origin |
| `OPENAI_API_KEY` | — | Required for image-to-word OCR |

### Frontend (`.env` — optional)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `` (empty) | Backend URL — leave empty to use Vite's proxy |

---

## Production Build

### Backend

```bash
cd backend
npm run build      # compiles TypeScript to dist/
npm start          # runs dist/index.js
```

### Frontend

```bash
cd frontend
npm run build      # outputs to dist/
npm run preview    # serves the production build locally
```

---

## Hebrew Support Notes

| Output | Hebrew RTL |
|---|---|
| **Word (.docx)** | Full RTL — alignment, bidirectional flag, David font |
| **PDF** | Characters render correctly; RTL reordering not supported (pdf-lib limitation with built-in fonts). Use Word output for Hebrew-heavy documents. |

---

## Limits & Constraints

| Constraint | Value |
|---|---|
| Max file size | 10 MB |
| Accepted image types | JPG, PNG |
| OCR timeout (frontend) | 90 seconds |
| Max image sent to OpenAI | 1500×1500 px (auto-resized) |
| Text body limit | 2 MB (Express JSON limit) |
