interface DropZoneBaseProps {
    accept: string;
    label: string;
    error?: string | null;
    disabled?: boolean;
    ghost?: boolean;
    id?: string;
    className?: string;
}
interface DropZoneSingleProps extends DropZoneBaseProps {
    multiple?: false;
    onFile: (file: File) => void;
}
interface DropZoneMultiProps extends DropZoneBaseProps {
    multiple: true;
    onFiles: (files: File[]) => void;
}
export type DropZoneProps = DropZoneSingleProps | DropZoneMultiProps;
export declare function DropZone(props: DropZoneProps): import("react/jsx-runtime").JSX.Element;
export {};
