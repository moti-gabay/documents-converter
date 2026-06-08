import { useState } from 'react';
import ModeSelector from './components/ModeSelector';
import FormatSelector from './components/FormatSelector';
import DropZone from './components/DropZone';
import StatusMessage from './components/StatusMessage';
import {
  convertImageToPdf,
  convertImageToWord,
  convertTextToPdf,
  convertTextToWord,
} from './services/api';
import type { AppStatus, ConversionMode, OutputFormat } from './types';
import './App.css';

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function App() {
  const [mode, setMode] = useState<ConversionMode>('image');
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [format, setFormat] = useState<OutputFormat>('pdf');
  const [status, setStatus] = useState<AppStatus>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  const isLoading = status === 'loading';
  const canConvert = !isLoading && (mode === 'image' ? !!file : text.trim().length > 0);

  const handleModeChange = (next: ConversionMode) => {
    setMode(next);
    setFile(null);
    setText('');
    setStatus('idle');
    setStatusMsg('');
  };

  const handleConvert = async () => {
    setStatus('loading');
    setStatusMsg('');
    try {
      let blob: Blob;
      let filename: string;

      if (mode === 'image' && file) {
        if (format === 'pdf') {
          blob = await convertImageToPdf(file);
          filename = file.name.replace(/\.[^.]+$/, '') + '.pdf';
        } else {
          blob = await convertImageToWord(file);
          filename = file.name.replace(/\.[^.]+$/, '') + '.docx';
        }
      } else {
        if (format === 'pdf') {
          blob = await convertTextToPdf(text);
          filename = 'document.pdf';
        } else {
          blob = await convertTextToWord(text);
          filename = 'document.docx';
        }
      }

      triggerDownload(blob, filename);
      setStatus('success');
      setStatusMsg(`Converted to ${format === 'pdf' ? 'PDF' : 'Word'} — download started!`);
    } catch (err) {
      setStatus('error');
      setStatusMsg(err instanceof Error ? err.message : 'An unexpected error occurred.');
    }
  };

  const handleReset = () => {
    setFile(null);
    setText('');
    setStatus('idle');
    setStatusMsg('');
  };

  const loadingLabel =
    mode === 'image' && format === 'word' ? 'Extracting text with AI…' : 'Converting…';

  return (
    <div className="app">
      <div className="app-wrap">

        {/* ── Header ─────────────────────────────────────────── */}
        <header className="app-header">
          <div className="logo" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
              <rect width="40" height="40" rx="10" fill="url(#grad)" />
              <path d="M12 10h11l7 7v13a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2z" fill="white" fillOpacity=".9" />
              <path d="M23 10v7h7" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
              <line x1="15" y1="20" x2="25" y2="20" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="15" y1="24" x2="25" y2="24" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="15" y1="28" x2="21" y2="28" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <h1 className="app-title">Document Converter</h1>
            <p className="app-subtitle">Images &amp; text to PDF or Word — Hebrew &amp; English OCR</p>
          </div>
        </header>

        {/* ── Card ───────────────────────────────────────────── */}
        <main className="card">
          <ModeSelector mode={mode} onChange={handleModeChange} />

          <div className="card-body">
            {mode === 'image' ? (
              <DropZone
                file={file}
                onFileAccepted={setFile}
                onFileRemoved={() => setFile(null)}
                disabled={isLoading}
              />
            ) : (
              <div className="text-zone">
                <textarea
                  className="text-area"
                  placeholder="Paste or type your text or Markdown here…&#10;&#10;# Heading&#10;**bold** *italic*"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={isLoading}
                  rows={11}
                  dir="auto"
                />
                <p className="text-hint">Supports Markdown: <code># H1</code>, <code>## H2</code>, <code>**bold**</code>, <code>*italic*</code></p>
              </div>
            )}

            <FormatSelector format={format} mode={mode} onChange={setFormat} />

            <button
              type="button"
              className={`convert-btn${isLoading ? ' is-loading' : ''}`}
              onClick={handleConvert}
              disabled={!canConvert}
            >
              {isLoading ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  {loadingLabel}
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Convert &amp; Download
                </>
              )}
            </button>

            <StatusMessage status={status} message={statusMsg} onReset={handleReset} />
          </div>
        </main>

        {/* ── Footer ─────────────────────────────────────────── */}
        <footer className="app-footer">
          Supports JPG &amp; PNG up to 10 MB &bull; Powered by GPT-4o Vision for OCR
        </footer>
      </div>
    </div>
  );
}
