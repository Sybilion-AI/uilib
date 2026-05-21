import { useRef, useState } from 'react';

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
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (!ref.current) return;

    const isOverflowingHorizontally =
      ref.current.scrollWidth - ref.current.clientWidth > 3;
    const isOverflowingVertically =
      ref.current.scrollHeight - ref.current.clientHeight > 3;

    if (isOverflowingHorizontally || isOverflowingVertically) {
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
    return (
      <Tooltip open={withTooltip} onOpenChange={setWithTooltip}>
        <TooltipTrigger asChild>{textElement}</TooltipTrigger>
        <TooltipContent
          side={side}
          overTrigger={overTrigger}
          maxWidth={maxWidth}
          style={width !== undefined ? { width: `${width}px` } : undefined}
        >
          {children}
        </TooltipContent>
      </Tooltip>
    );
  }

  return textElement;
}

export { TextWithDeferTooltip };
