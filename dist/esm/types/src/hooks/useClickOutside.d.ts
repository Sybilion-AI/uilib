import { RefObject } from 'react';
type Options = {
    elem: RefObject<HTMLElement>;
    isCapture?: boolean;
    isPassive?: boolean;
    isActive?: boolean;
    callback: (e: MouseEvent) => void;
};
export default function useClickOutside({ elem, callback, isActive, isCapture, isPassive, }: Options): void;
export {};
