import { HTMLAttributes } from 'react';

// Base component props
export interface MobileAdaptiveSelectorProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  // Required props
  value: string | number;
  onChange: (value: string) => void;
  items: SelectorItem[];

  // Optional props
  placeholder?: string;
  disabled?: boolean;
  variant?: 'default' | 'clear';
  size?: 'sm' | 'md' | 'lg';
  darker?: boolean;

  // Style-related props
  className?: string;

  isDropdown?: boolean;
}

// Item type for selector options
export interface SelectorItem {
  value: string | number;
  label: string;
  icon?: string;
}
