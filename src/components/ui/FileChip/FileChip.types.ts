export type FileChipFormat = 'csv' | 'pdf' | 'text' | 'dashboard';

export type FileChipProps = {
  name: string;
  format: FileChipFormat;
  hint: string;
  onClick?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
  className?: string;
};
