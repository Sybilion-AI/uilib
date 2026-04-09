import { RefObject } from 'react';
type ElementType = RefObject<HTMLElement | null> | null;
export type UseEventParams = {
    elem?: ElementType[] | ElementType;
    event: string | string[];
    callback: (e: Event) => void;
    isActive?: boolean;
    isCapture?: boolean;
};
export default function useEvent({ elem, event, callback, isActive, isCapture, }: UseEventParams): void;
export {};
