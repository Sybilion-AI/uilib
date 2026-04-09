'use client';

import { useLayoutEffect, useRef, useState } from 'react';

import type { SmartTextTruncateProps } from './SmartTextTruncate.types';

const ELLIPSIS = ' ... ';
const END_CHARS_COUNT = 10;

function SmartTextTruncate({
  children,
  className,
  ...props
}: SmartTextTruncateProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const fullTextRef = useRef<HTMLSpanElement>(null);
  const [displayText, setDisplayText] = useState<string>(
    typeof children === 'string' ? children : '',
  );
  const [resizeTrigger, setResizeTrigger] = useState(0);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const fullText = fullTextRef.current;

    if (!container || !fullText || typeof children !== 'string') {
      return;
    }

    const text = children;

    // If text is shorter than END_CHARS_COUNT, no truncation needed
    if (text.length <= END_CHARS_COUNT) {
      setDisplayText(text);
      return;
    }

    // Measure container width
    const containerWidth = container.clientWidth;
    if (containerWidth === 0) {
      // Container not yet rendered, keep current text
      return;
    }

    // Measure full text width
    fullText.textContent = text;
    const fullTextWidth = fullText.scrollWidth;

    // If text fits, show full text
    if (fullTextWidth <= containerWidth) {
      setDisplayText(text);
      return;
    }

    // Calculate truncated text: <start>...<last 10 chars>
    const endPart = text.slice(-END_CHARS_COUNT);

    // Binary search for optimal start length
    let left = 0;
    let right = text.length - END_CHARS_COUNT;
    let bestStart = 0;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const startPart = text.slice(0, mid);
      const truncated = startPart + ELLIPSIS + endPart;

      fullText.textContent = truncated;
      const truncatedWidth = fullText.scrollWidth;

      if (truncatedWidth <= containerWidth) {
        bestStart = mid;
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    // Ensure we have at least some start text
    if (bestStart === 0) {
      // If even just ellipsis + end doesn't fit, show only end part
      fullText.textContent = ELLIPSIS + endPart;
      if (fullText.scrollWidth <= containerWidth) {
        setDisplayText(ELLIPSIS + endPart);
      } else {
        // Last resort: show only end part without ellipsis
        setDisplayText(endPart);
      }
    } else {
      setDisplayText(text.slice(0, bestStart) + ELLIPSIS + endPart);
    }
  }, [children, resizeTrigger]);

  // Handle ResizeObserver for container resizing
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      // Trigger recalculation by updating resizeTrigger
      setResizeTrigger(prev => prev + 1);
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  if (typeof children !== 'string') {
    return (
      <span className={className} {...props}>
        {children}
      </span>
    );
  }

  return (
    <span
      ref={containerRef}
      className={className}
      {...props}
      style={{ position: 'relative', ...props.style }}
    >
      {displayText}
      <span
        ref={fullTextRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          whiteSpace: 'nowrap',
          top: '-9999px',
        }}
        aria-hidden="true"
      >
        {children}
      </span>
    </span>
  );
}

export { SmartTextTruncate };
