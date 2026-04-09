import { HTMLAttributes } from 'react';
export interface MobileAdaptiveSelectorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
    value: string | number;
    onChange: (value: string) => void;
    items: SelectorItem[];
    placeholder?: string;
    disabled?: boolean;
    variant?: 'default' | 'clear';
    size?: 'sm' | 'md' | 'lg';
    darker?: boolean;
    className?: string;
    isDropdown?: boolean;
}
export interface SelectorItem {
    value: string | number;
    label: string;
    icon?: string;
}
