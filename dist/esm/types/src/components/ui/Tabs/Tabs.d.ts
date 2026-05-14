import { TabsContentProps, TabsListProps, TabsProps, TabsTriggerProps } from './Tabs.types';
declare function Tabs({ className, variant, size, darker, ...props }: TabsProps & {
    variant?: 'button' | 'link';
    size?: 'sm' | 'md' | 'lg';
    darker?: boolean;
}): import("react/jsx-runtime").JSX.Element;
declare function TabsList({ className, fullWidth, darker, ...props }: TabsListProps & {
    fullWidth?: boolean;
    darker?: boolean;
}): import("react/jsx-runtime").JSX.Element;
declare function TabsTrigger({ className, ...props }: TabsTriggerProps): import("react/jsx-runtime").JSX.Element;
declare function TabsContent({ className, ...props }: TabsContentProps): import("react/jsx-runtime").JSX.Element;
export { Tabs, TabsList, TabsTrigger, TabsContent };
