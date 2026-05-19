import cn from 'classnames';
import { useCallback, useEffect, useRef, useState } from 'react';

import S from './DropZone.styl';

interface DropZoneBaseProps {
  accept: string;
  label: string;
  error?: string | null;
  disabled?: boolean;
  ghost?: boolean;
  /** When `container`, drag overlay fills the parent bounds instead of the viewport. */
  overlayScope?: 'viewport' | 'container';
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
    overlayScope = 'viewport',
    id,
    className,
  } = props;
  const [isDragging, setIsDragging] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const inputId =
    id || `dropzone-file-input-${Math.random().toString(36).substr(2, 9)}`;

  const dropProcessedRef = useRef(false);

  const emitDroppedFiles = useCallback(
    (files: FileList) => {
      if (disabled || dropProcessedRef.current || files.length === 0) return;

      const list = Array.from(files).filter(f => matchesAccept(f, accept));
      if (list.length === 0) return;

      dropProcessedRef.current = true;

      if (props.multiple === true) {
        props.onFiles(list);
      } else {
        props.onFile(list[0]!);
      }
    },
    [accept, disabled, props],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      emitDroppedFiles(e.dataTransfer.files);
    },
    [disabled, emitDroppedFiles],
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
    const root = rootRef.current;
    if (!root) return;

    const targetElement =
      overlayScope === 'container'
        ? root.parentElement
        : ((root.closest('[role="dialog"]') as HTMLElement | null) ??
          document.body);

    if (!targetElement) return;

    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault();
      dropProcessedRef.current = false;
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

    const handleGlobalDropPrevent = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleGlobalDropFinalize = (e: DragEvent) => {
      if (overlayScope === 'container' && e.dataTransfer?.files?.length) {
        emitDroppedFiles(e.dataTransfer.files);
      }
      setIsDragging(false);
    };

    targetElement.addEventListener('dragover', handleGlobalDragOver);
    targetElement.addEventListener('dragleave', handleGlobalDragLeave);
    targetElement.addEventListener('drop', handleGlobalDropPrevent, true);
    targetElement.addEventListener('drop', handleGlobalDropFinalize);

    return () => {
      targetElement.removeEventListener('dragover', handleGlobalDragOver);
      targetElement.removeEventListener('dragleave', handleGlobalDragLeave);
      targetElement.removeEventListener('drop', handleGlobalDropPrevent, true);
      targetElement.removeEventListener('drop', handleGlobalDropFinalize);
    };
  }, [emitDroppedFiles, overlayScope]);

  const shouldShowDropArea = !ghost || isDragging;
  const multiple = props.multiple === true;

  const isContainerOverlay = overlayScope === 'container';

  return (
    <div
      ref={rootRef}
      className={cn(
        S.root,
        isContainerOverlay && S.rootContained,
        isDragging && isContainerOverlay && S.rootDragging,
        className,
      )}
      style={
        isContainerOverlay
          ? { pointerEvents: isDragging ? 'auto' : 'none' }
          : undefined
      }
    >
      {shouldShowDropArea && (
        <div
          ref={dropAreaRef}
          className={cn(
            S.dropArea,
            isDragging
              ? isContainerOverlay
                ? S.isDraggingContained
                : S.isDragging
              : '',
            disabled ? S.disabled : '',
          )}
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
