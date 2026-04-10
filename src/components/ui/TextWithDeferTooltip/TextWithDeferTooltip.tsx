import { CSSProperties, useRef, useState } from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#uilib/components/ui/Tooltip';

import type { TextWithDeferTooltipProps } from './TextWithDeferTooltip.types';

function TextWithDeferTooltip({
  className,
  children,
  width,
  maxWidth,
  side = 'bottom',
  overTrigger = false,
  ...props
}: TextWithDeferTooltipProps) {
  const [withTooltip, setWithTooltip] = useState(false);
  const [tooltipStyles, setTooltipStyles] = useState<CSSProperties>({});
  const ref = useRef<HTMLDivElement>(null);
  const cachedFontSizeRef = useRef<string | null>(null);

  const handleMouseEnter = () => {
    if (!ref.current) return;

    const isOverflowingHorizontally =
      ref.current.scrollWidth - ref.current.clientWidth > 3;
    const isOverflowingVertically =
      ref.current.scrollHeight - ref.current.clientHeight > 3;

    if (isOverflowingHorizontally || isOverflowingVertically) {
      const styles: CSSProperties = {
        fontSize: cachedFontSizeRef.current || undefined,
      };

      if (ref.current) {
        const {
          width: rectWidth,
          left,
          top,
        } = ref.current.getBoundingClientRect();

        styles.width = `${width ?? rectWidth}px`;

        if (!cachedFontSizeRef.current) {
          const { fontSize } = window.getComputedStyle(ref.current);
          cachedFontSizeRef.current = fontSize;
          styles.fontSize = fontSize;
        }

        if (overTrigger) {
          styles.transform = `translate(${left}px, ${top}px) !important`;
          // styles.translateX = `${left}px`;
          // styles.translateY = `${top}px`;
        }
      }

      setTooltipStyles(styles);
      setWithTooltip(true);
    }
  };

  const textElement = (
    <div
      ref={ref}
      className={className}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {children}
    </div>
  );

  if (withTooltip) {
    const tooltipSide = overTrigger ? 'bottom' : side;

    return (
      <Tooltip open={withTooltip} onOpenChange={setWithTooltip}>
        <TooltipTrigger asChild>{textElement}</TooltipTrigger>
        <TooltipContent
          side={tooltipSide}
          style={{
            ...(maxWidth !== undefined && { maxWidth: `${maxWidth}px` }),
            ...tooltipStyles,
          }}
        >
          {children}
        </TooltipContent>
      </Tooltip>
    );
  }

  return textElement;
}

export { TextWithDeferTooltip };
