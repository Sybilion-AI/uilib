export type FoldableVariant = 'default' | 'clear';

export interface FoldableProps {
  header: React.ReactNode;
  content: React.ReactNode;
  contentClassName?: string;
  defaultUnfolded?: boolean;
  /** `clear` strips the card chrome (border, fill). Default keeps the framed panel. */
  variant?: FoldableVariant;
}
