import React, { ReactNode } from 'react';
interface DraggingButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style' | 'title' | 'className'> {
    top?: string;
    left?: string;
    className?: string;
    icon: ReactNode;
    title: string;
    isDragging: boolean;
    size?: 'sm' | 'md' | 'lg';
}
export declare const DraggingButton: React.ForwardRefExoticComponent<DraggingButtonProps & React.RefAttributes<HTMLButtonElement>>;
export {};
