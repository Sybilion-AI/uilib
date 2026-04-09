import { HTMLAttributes } from 'react';
export interface LogoProps extends HTMLAttributes<HTMLDivElement> {
    showText?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}
export type LogoSize = 'sm' | 'md' | 'lg';
