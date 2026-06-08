import type { AppStatus } from '../types';

interface Props {
  status: AppStatus;
  message: string;
  onReset: () => void;
}

export default function StatusMessage({ status, message, onReset }: Props) {
  if (status === 'idle') return null;

  if (status === 'loading') {
    return (
      <div className="status status-loading" role="status" aria-live="polite">
        <span className="spinner" aria-hidden="true" />
        <p>Processing&hellip;</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="status status-success" role="status" aria-live="polite">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20" aria-hidden="true">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <p>{message}</p>
        <button type="button" className="status-action" onClick={onReset}>Convert Another</button>
      </div>
    );
  }

  return (
    <div className="status status-error" role="alert" aria-live="assertive">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p>{message}</p>
      <button type="button" className="status-action" onClick={onReset}>Try Again</button>
    </div>
  );
}
