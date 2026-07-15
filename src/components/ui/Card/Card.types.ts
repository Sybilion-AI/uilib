import { TextWithDeferTooltipProps } from '#uilib/components/ui/TextWithDeferTooltip';

export type CardSize = 'xs' | 's' | 'm' | 'l';

export interface CardProps extends React.ComponentProps<'div'> {
  /** Shorthand for matching `paddingSize` and `radiusSize`. */
  size?: CardSize;
  paddingSize?: CardSize;
  radiusSize?: CardSize | 'xl';
}

export interface CardHeaderProps extends Omit<
  React.ComponentProps<'div'>,
  'title'
> {
  className?: string;
  textsClassName?: string;
  icon?: React.ReactNode;
  iconWithBackground?: boolean;
  title?: React.ReactNode;
  titleClassName?: string;
  description?: React.ReactNode;
  descriptionClassName?: string;
  tooltipProps?: TextWithDeferTooltipProps;
}

export interface CardTitleProps extends TextWithDeferTooltipProps {}

export interface CardDescriptionProps extends TextWithDeferTooltipProps {}

export interface CardActionProps extends React.ComponentProps<'div'> {}

export interface CardContentProps extends React.ComponentProps<'div'> {
  centered?: boolean;
  fullHeight?: boolean;
  noScroll?: boolean;
  autoScrollBottom?: boolean;
  yScrollbarClassName?: string;
}

export interface CardFooterProps extends React.ComponentProps<'div'> {}
