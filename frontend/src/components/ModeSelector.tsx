import type { ConversionMode } from '../types';

interface Props {
  mode: ConversionMode;
  onChange: (mode: ConversionMode) => void;
}

export default function ModeSelector({ mode, onChange }: Props) {
  return (
    <div className="mode-selector">
      <button
        className={`mode-tab ${mode === 'image' ? 'active' : ''}`}
        onClick={() => onChange('image')}
        type="button"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21,15 16,10 5,21" />
        </svg>
        תמונה לקובץ
      </button>

      <button
        className={`mode-tab ${mode === 'pdf' ? 'active' : ''}`}
        onClick={() => onChange('pdf')}
        type="button"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <path d="M9 13h1.5a1.5 1.5 0 0 1 0 3H9v-3z" />
          <path d="M14 13h1a2 2 0 0 1 0 4h-1v-4z" />
        </svg>
        PDF ל-Word
      </button>

      <button
        className={`mode-tab ${mode === 'text' ? 'active' : ''}`}
        onClick={() => onChange('text')}
        type="button"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
        טקסט / Markdown
      </button>
    </div>
  );
}
