export type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

export interface TextWithDeferTooltipProps extends Omit<
  React.ComponentProps<'div'>,
  'style'
> {
  width?: number;
  maxWidth?: number;
  side?: TooltipSide;
  overTrigger?: boolean;
}
