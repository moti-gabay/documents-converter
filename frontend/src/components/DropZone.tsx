import { useEffect, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface Props {
  file: File | null;
  onFileAccepted: (file: File) => void;
  onFileRemoved: () => void;
  disabled?: boolean;
}

const ACCEPT = { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] };
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export default function DropZone({ file, onFileAccepted, onFileRemoved, disabled }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onDrop = useCallback(
    (accepted: File[]) => { if (accepted[0]) onFileAccepted(accepted[0]); },
    [onFileAccepted],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxSize: MAX_SIZE,
    maxFiles: 1,
    disabled,
  });

  const rejectionMsg = fileRejections[0]?.errors[0]?.message;

  if (file && previewUrl) {
    const size = file.size > 1_048_576
      ? `${(file.size / 1_048_576).toFixed(2)} MB`
      : `${(file.size / 1024).toFixed(1)} KB`;

    return (
      <div className="dropzone-preview">
        <img src={previewUrl} alt="Preview" className="preview-img" />
        <div className="preview-meta">
          <p className="preview-name" title={file.name}>{file.name}</p>
          <p className="preview-size">{size}</p>
          <button
            type="button"
            className="preview-remove"
            onClick={onFileRemoved}
            disabled={disabled}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
            Remove
          </button>
        </div>
      </div>
    );
  }

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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" width="52" height="52">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21,15 16,10 5,21" />
          </svg>
        </div>
        {isDragActive && !isDragReject
          ? <p className="dz-text">Drop it here!</p>
          : <>
              <p className="dz-text">Drag &amp; drop an image here</p>
              <p className="dz-sub">or <span className="dz-browse">click to browse</span></p>
              <p className="dz-hint">JPG &bull; PNG &bull; up to 10 MB</p>
            </>
        }
        {rejectionMsg && <p className="dz-error">{rejectionMsg}</p>}
        {isDragReject && <p className="dz-error">Only JPG and PNG files are supported</p>}
      </div>
    </div>
  );
}
