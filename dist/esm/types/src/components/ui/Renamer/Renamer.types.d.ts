export interface RenamerProps {
    className?: string;
    value: string;
    onInput?: (value: string) => void;
    onChange: (value: string) => void;
    onDelete?: () => void;
    children?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
    placeholder?: string;
    round?: boolean;
}
