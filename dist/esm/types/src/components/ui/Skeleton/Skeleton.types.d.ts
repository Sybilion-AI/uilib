import { ComponentProps } from 'react';
export type SkeletonSize = 'sm' | 'md' | 'lg';
export type SkeletonShape = 'rectangle' | 'circle' | 'rounded';
export interface SkeletonProps extends ComponentProps<'div'> {
    size?: SkeletonSize;
    shape?: SkeletonShape;
    className?: string;
}
