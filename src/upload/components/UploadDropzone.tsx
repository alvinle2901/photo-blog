'use client';

import { useCallback, useRef, useState } from 'react';
import type { Photo } from '@/photo';

type UploadStatus =
  | { state: 'idle' }
  | { state: 'uploading'; fileName: string; progress: number }
  | { state: 'success'; photo: Photo }
  | { state: 'error'; message: string };

export function UploadDropzone() {
  const [status, setStatus] = useState<UploadStatus>({ state: 'idle' });
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setStatus({ state: 'error', message: 'Only image files are supported.' });
      return;
    }

    setStatus({ state: 'uploading', fileName: file.name, progress: 0 });

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', { method: 'POST', body: formData });

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Upload failed' }));
      setStatus({ state: 'error', message: error ?? 'Upload failed' });
      return;
    }

    const photo: Photo = await res.json();
    setStatus({ state: 'success', photo });
  }, []);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;
      uploadFile(files[0]);
    },
    [uploadFile],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => inputRef.current?.click()}
        className={[
          'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
          isDragOver ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <p className="text-sm text-gray-500">
          Drop a photo here, or <span className="text-black font-medium">click to browse</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">JPEG, PNG, HEIC, TIFF, WebP</p>
      </div>

      {/* Status */}
      {status.state === 'uploading' && (
        <div className="text-sm text-gray-600 space-y-1">
          <p>Uploading <span className="font-medium">{status.fileName}</span>…</p>
          <p className="text-xs text-gray-400">Extracting EXIF, generating blur hash and color palette</p>
        </div>
      )}

      {status.state === 'error' && (
        <div className="text-sm text-red-600 flex items-center justify-between">
          <span>{status.message}</span>
          <button
            onClick={() => setStatus({ state: 'idle' })}
            className="text-xs text-gray-500 hover:text-black"
          >
            Dismiss
          </button>
        </div>
      )}

      {status.state === 'success' && (
        <div className="border rounded-lg p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-green-700">Upload complete</p>
            <p className="text-xs text-gray-500">
              {status.photo.make && status.photo.model
                ? `${status.photo.make} ${status.photo.model}`
                : status.photo.id}
            </p>
          </div>
          <button
            onClick={() => setStatus({ state: 'idle' })}
            className="text-xs text-gray-500 hover:text-black"
          >
            Upload another
          </button>
        </div>
      )}
    </div>
  );
}
