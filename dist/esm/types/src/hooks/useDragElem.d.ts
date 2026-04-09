import type { UseEventParams } from './useEvent';
export type Delta = {
    x: number;
    y: number;
};
type Props = Pick<UseEventParams, 'elem'> & {
    onDrag: (delta: Delta, e: PointerEvent) => void;
    onDragStart?: (e: PointerEvent) => void;
    onDragEnd?: (e: PointerEvent) => void;
    isActive?: boolean;
};
export default function useElemDrag({ elem, onDrag, onDragStart, onDragEnd, isActive, }: Props): {
    isDragging: boolean;
};
export {};
