import { useEffect, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import type { ConversionMode } from '../types';

interface Props {
  mode: ConversionMode;
  file: File | null;
  onFileAccepted: (file: File) => void;
  onFileRemoved: () => void;
  disabled?: boolean;
}

const IMAGE_ACCEPT = { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] };
const PDF_ACCEPT   = { 'application/pdf': ['.pdf'] };

function FilePreview({ file, onRemoved, disabled }: { file: File; onRemoved: () => void; disabled?: boolean }) {
  const isPdf = file.type === 'application/pdf';
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isPdf) return;
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file, isPdf]);

  const size = file.size > 1_048_576
    ? `${(file.size / 1_048_576).toFixed(2)} MB`
    : `${(file.size / 1024).toFixed(1)} KB`;

  return (
    <div className="dropzone-preview">
      {isPdf ? (
        <div className="preview-pdf-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="42" height="42">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14,2 14,8 20,8" />
            <path d="M9 13h1.5a1.5 1.5 0 0 1 0 3H9v-3z" />
            <path d="M14 13h1a2 2 0 0 1 0 4h-1v-4z" />
          </svg>
          <span>PDF</span>
        </div>
      ) : (
        imgUrl && <img src={imgUrl} alt="Preview" className="preview-img" />
      )}
      <div className="preview-meta">
        <p className="preview-name" title={file.name}>{file.name}</p>
        <p className="preview-size">{size}</p>
        <button type="button" className="preview-remove" onClick={onRemoved} disabled={disabled}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
          הסר
        </button>
      </div>
    </div>
  );
}

export default function DropZone({ mode, file, onFileAccepted, onFileRemoved, disabled }: Props) {
  const isPdfMode = mode === 'pdf';
  const accept    = isPdfMode ? PDF_ACCEPT : IMAGE_ACCEPT;
  const maxSize   = isPdfMode ? 25 * 1024 * 1024 : 10 * 1024 * 1024;
  const hintText  = isPdfMode ? 'PDF עד 25 MB' : 'JPG · PNG · עד 10 MB';
  const rejectMsg = isPdfMode ? 'רק קבצי PDF נתמכים' : 'רק קבצי JPG ו-PNG נתמכים';

  const onDrop = useCallback(
    (accepted: File[]) => { if (accepted[0]) onFileAccepted(accepted[0]); },
    [onFileAccepted],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    onDrop, accept, maxSize, maxFiles: 1, disabled,
  });

  if (file) {
    return <FilePreview file={file} onRemoved={onFileRemoved} disabled={disabled} />;
  }

  const rejectionMsg = fileRejections[0]?.errors[0]?.message;

  return (
    <div
      {...getRootProps()}
      className={[
        'dropzone',
        isDragActive && !isDragReject ? 'drag-over' : '',
        isDragReject ? 'drag-reject' : '',
        disabled ? 'dz-disabled' : '',
      ].filter(Boolean).join(' ')}
    >
      <input {...getInputProps()} />
      <div className="dz-body">
        <div className="dz-icon">
          {isPdfMode ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" width="52" height="52">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <path d="M9 13h1.5a1.5 1.5 0 0 1 0 3H9v-3z" />
              <path d="M14 13h1a2 2 0 0 1 0 4h-1v-4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" width="52" height="52">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21,15 16,10 5,21" />
            </svg>
          )}
        </div>
        {isDragActive && !isDragReject
          ? <p className="dz-text">שחרר כאן!</p>
          : <>
              <p className="dz-text">גרור ושחרר קובץ כאן</p>
              <p className="dz-sub">או <span className="dz-browse">לחץ לבחירה</span></p>
              <p className="dz-hint">{hintText}</p>
            </>
        }
        {(rejectionMsg || isDragReject) && (
          <p className="dz-error">{isDragReject ? rejectMsg : rejectionMsg}</p>
        )}
      </div>
    </div>
  );
}
