import { Checkbox } from '../Checkbox';
interface LabledCheckboxProps extends React.ComponentProps<typeof Checkbox> {
    label: string;
}
export declare const LabledCheckbox: ({ id, label, className, ...props }: LabledCheckboxProps) => import("react/jsx-runtime").JSX.Element;
export {};
