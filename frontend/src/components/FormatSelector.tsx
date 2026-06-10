import type { ConversionMode, OutputFormat } from '../types';

interface Props {
  format: OutputFormat;
  mode: ConversionMode;
  onChange: (format: OutputFormat) => void;
}

export default function FormatSelector({ format, mode, onChange }: Props) {
  // PDF → Word is always Word — no choice needed
  if (mode === 'pdf') {
    return (
      <div className="format-selector">
        <span className="format-label">פורמט פלט:</span>
        <div className="format-tabs">
          <button type="button" className="format-tab active" disabled>
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
              <polyline points="14,2 14,8 20,8" fill="none" stroke="white" strokeWidth="1.5" />
            </svg>
            Word (.docx)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="format-selector">
      <span className="format-label">המר ל:</span>
      <div className="format-tabs">
        <button
          type="button"
          className={`format-tab ${format === 'pdf' ? 'active' : ''}`}
          onClick={() => onChange('pdf')}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
            <polyline points="14,2 14,8 20,8" fill="none" stroke="white" strokeWidth="1.5" />
          </svg>
          PDF
        </button>
        <button
          type="button"
          className={`format-tab ${format === 'word' ? 'active' : ''}`}
          onClick={() => onChange('word')}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
            <polyline points="14,2 14,8 20,8" fill="none" stroke="white" strokeWidth="1.5" />
          </svg>
          Word (.docx)
          {mode === 'image' && <span className="ai-badge">AI OCR</span>}
        </button>
      </div>
    </div>
  );
}
