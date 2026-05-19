import { jsxs, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { useState, useRef, useCallback, useEffect } from 'react';
import S from './DropZone.styl.js';

function matchesAcceptPart(file, part) {
    const p = part.trim().toLowerCase();
    if (!p)
        return false;
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
function matchesAccept(file, accept) {
    const trimmed = accept.trim();
    if (!trimmed)
        return true;
    const parts = trimmed
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    if (parts.length === 0)
        return true;
    return parts.some(part => matchesAcceptPart(file, part));
}
function DropZone(props) {
    const { accept, label, error, disabled = false, ghost = false, overlayScope = 'viewport', id, className, } = props;
    const [isDragging, setIsDragging] = useState(false);
    const rootRef = useRef(null);
    const dropAreaRef = useRef(null);
    const inputId = id || `dropzone-file-input-${Math.random().toString(36).substr(2, 9)}`;
    const dropProcessedRef = useRef(false);
    const emitDroppedFiles = useCallback((files) => {
        if (disabled || dropProcessedRef.current || files.length === 0)
            return;
        const list = Array.from(files).filter(f => matchesAccept(f, accept));
        if (list.length === 0)
            return;
        dropProcessedRef.current = true;
        if (props.multiple === true) {
            props.onFiles(list);
        }
        else {
            props.onFile(list[0]);
        }
    }, [accept, disabled, props]);
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (disabled)
            return;
        emitDroppedFiles(e.dataTransfer.files);
    }, [disabled, emitDroppedFiles]);
    const handleFileInput = useCallback((e) => {
        if (disabled)
            return;
        const raw = e.target.files;
        if (!raw?.length)
            return;
        const list = Array.from(raw).filter(f => matchesAccept(f, accept));
        if (props.multiple === true) {
            if (list.length > 0) {
                props.onFiles(list);
            }
        }
        else {
            const file = list[0];
            if (file) {
                props.onFile(file);
            }
        }
        e.target.value = '';
    }, [accept, disabled, props]);
    useEffect(() => {
        const root = rootRef.current;
        if (!root)
            return;
        const targetElement = overlayScope === 'container'
            ? root.parentElement
            : (root.closest('[role="dialog"]') ??
                document.body);
        if (!targetElement)
            return;
        const handleGlobalDragOver = (e) => {
            e.preventDefault();
            dropProcessedRef.current = false;
            setIsDragging(true);
        };
        const handleGlobalDragLeave = (e) => {
            // Only hide if we're leaving the target element itself (not a child)
            // relatedTarget can be null when leaving the window
            if (!e.relatedTarget ||
                !targetElement.contains(e.relatedTarget)) {
                setIsDragging(false);
            }
        };
        const handleGlobalDropPrevent = (e) => {
            e.preventDefault();
        };
        const handleGlobalDropFinalize = (e) => {
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
    return (jsxs("div", { ref: rootRef, className: cn(S.root, isContainerOverlay && S.rootContained, isDragging && isContainerOverlay && S.rootDragging, className), style: isContainerOverlay
            ? { pointerEvents: isDragging ? 'auto' : 'none' }
            : undefined, children: [shouldShowDropArea && (jsxs("div", { ref: dropAreaRef, className: cn(S.dropArea, isDragging
                    ? isContainerOverlay
                        ? S.isDraggingContained
                        : S.isDragging
                    : '', disabled ? S.disabled : ''), onDrop: handleDrop, children: [jsx("input", { type: "file", accept: accept, multiple: multiple, onChange: handleFileInput, className: S.fileInput, id: inputId, disabled: disabled }), jsx("label", { htmlFor: inputId, className: S.label, style: {
                            cursor: disabled ? 'not-allowed' : 'pointer',
                        }, children: label })] })), error && jsx("div", { className: S.error, children: error })] }));
}

export { DropZone };
