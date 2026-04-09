import { useCallback, useEffect, useRef, useState } from 'react';

import S from './DropZone.styl';

interface DropZoneBaseProps {
  accept: string;
  label: string;
  error?: string | null;
  disabled?: boolean;
  ghost?: boolean;
  id?: string;
  className?: string;
}

interface DropZoneSingleProps extends DropZoneBaseProps {
  multiple?: false;
  onFile: (file: File) => void;
}

interface DropZoneMultiProps extends DropZoneBaseProps {
  multiple: true;
  onFiles: (files: File[]) => void;
}

export type DropZoneProps = DropZoneSingleProps | DropZoneMultiProps;

function matchesAcceptPart(file: File, part: string): boolean {
  const p = part.trim().toLowerCase();
  if (!p) return false;
  if (p.startsWith('.')) {
    return file.name.toLowerCase().endsWith(p);
  }
  if (p.includes('/')) {
    const t = file.type.toLowerCase();
    if (p.endsWith('/*')) {
      const prefix = p.slice(0, -1);
      return t.startsWith(prefix);
    }
    return t === p;
  }
  return false;
}

function matchesAccept(file: File, accept: string): boolean {
  const trimmed = accept.trim();
  if (!trimmed) return true;
  const parts = trimmed
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  if (parts.length === 0) return true;
  return parts.some(part => matchesAcceptPart(file, part));
}

export function DropZone(props: DropZoneProps) {
  const {
    accept,
    label,
    error,
    disabled = false,
    ghost = false,
    id,
    className,
  } = props;
  const [isDragging, setIsDragging] = useState(false);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const inputId =
    id || `dropzone-file-input-${Math.random().toString(36).substr(2, 9)}`;

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const list = Array.from(e.dataTransfer.files).filter(f =>
        matchesAccept(f, accept),
      );

      if (props.multiple === true) {
        if (list.length > 0) {
          props.onFiles(list);
        }
      } else {
        const file = list[0];
        if (file) {
          props.onFile(file);
        }
      }
    },
    [accept, disabled, props],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      const raw = e.target.files;
      if (!raw?.length) return;

      const list = Array.from(raw).filter(f => matchesAccept(f, accept));

      if (props.multiple === true) {
        if (list.length > 0) {
          props.onFiles(list);
        }
      } else {
        const file = list[0];
        if (file) {
          props.onFile(file);
        }
      }
      e.target.value = '';
    },
    [accept, disabled, props],
  );

  useEffect(() => {
    // Find closest dialog or fall back to body
    const dialog = dropAreaRef.current?.closest('[role="dialog"]');
    const targetElement = (dialog as HTMLElement) || document.body;

    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleGlobalDragLeave = (e: DragEvent) => {
      // Only hide if we're leaving the target element itself (not a child)
      // relatedTarget can be null when leaving the window
      if (
        !e.relatedTarget ||
        !targetElement.contains(e.relatedTarget as Node)
      ) {
        setIsDragging(false);
      }
    };

    const handleGlobalDrop = () => {
      setIsDragging(false);
    };

    targetElement.addEventListener('dragover', handleGlobalDragOver);
    targetElement.addEventListener('dragleave', handleGlobalDragLeave);
    targetElement.addEventListener('drop', handleGlobalDrop);

    return () => {
      targetElement.removeEventListener('dragover', handleGlobalDragOver);
      targetElement.removeEventListener('dragleave', handleGlobalDragLeave);
      targetElement.removeEventListener('drop', handleGlobalDrop);
    };
  }, []);

  const shouldShowDropArea = !ghost || isDragging;
  const multiple = props.multiple === true;

  return (
    <div className={`${S.root} ${className || ''}`}>
      {shouldShowDropArea && (
        <div
          ref={dropAreaRef}
          className={`${S.dropArea} ${isDragging ? S.isDragging : ''} ${disabled ? S.disabled : ''}`}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileInput}
            className={S.fileInput}
            id={inputId}
            disabled={disabled}
          />
          <label
            htmlFor={inputId}
            className={S.label}
            style={{
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          >
            {label}
          </label>
        </div>
      )}
      {error && <div className={S.error}>{error}</div>}
    </div>
  );
}
