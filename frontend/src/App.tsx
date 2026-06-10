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
  convertPdfToWord,
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

  const canConvert = !isLoading && (
    mode === 'text' ? text.trim().length > 0 : !!file
  );

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

      if (mode === 'pdf' && file) {
        blob = await convertPdfToWord(file);
        filename = file.name.replace(/\.pdf$/i, '') + '.docx';

      } else if (mode === 'image' && file) {
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
      setStatusMsg('ההמרה הושלמה — הקובץ מורד!');
    } catch (err) {
      setStatus('error');
      setStatusMsg(err instanceof Error ? err.message : 'שגיאה בלתי צפויה.');
    }
  };

  const handleReset = () => {
    setFile(null);
    setText('');
    setStatus('idle');
    setStatusMsg('');
  };

  const loadingLabel =
    mode === 'image' && format === 'word' ? 'מחלץ טקסט עם AI…' : 'ממיר…';

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
            <h1 className="app-title">ממיר מסמכים</h1>
            <p className="app-subtitle">תמונות, PDF וטקסט → Word או PDF · עברית ואנגלית</p>
          </div>
        </header>

        {/* ── Card ───────────────────────────────────────────── */}
        <main className="card">
          <ModeSelector mode={mode} onChange={handleModeChange} />

          <div className="card-body">
            {mode === 'text' ? (
              <div className="text-zone">
                <textarea
                  className="text-area"
                  placeholder="הדבק או הקלד טקסט או Markdown כאן…&#10;&#10;# כותרת&#10;**מודגש** *נטוי*"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={isLoading}
                  rows={11}
                  dir="auto"
                />
                <p className="text-hint">תומך ב-Markdown: <code># כותרת</code>, <code>**מודגש**</code>, <code>*נטוי*</code></p>
              </div>
            ) : (
              <DropZone
                mode={mode}
                file={file}
                onFileAccepted={setFile}
                onFileRemoved={() => setFile(null)}
                disabled={isLoading}
              />
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
                  המר והורד
                </>
              )}
            </button>

            <StatusMessage status={status} message={statusMsg} onReset={handleReset} />
          </div>
        </main>

        {/* ── Footer ─────────────────────────────────────────── */}
        <footer className="app-footer">
          תומך ב-JPG, PNG עד 10 MB · PDF עד 25 MB · מופעל על ידי GPT-4o Vision
        </footer>
      </div>
    </div>
  );
}
