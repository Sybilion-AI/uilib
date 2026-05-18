import { TabsListProps, TabsProps } from '#uilib/components/ui/Tabs';
export declare function PageTabs({ className, contentClassName, innerClassName, scrollbarClassName, items, tabsListProps, ...props }: {
    items: {
        value: string;
        label: string;
        content?: React.ReactNode;
    }[];
    tabsListProps?: TabsListProps & {
        fullWidth?: boolean;
        withPaddings?: boolean;
    };
} & TabsProps & {
    contentClassName?: string;
    innerClassName?: string;
    scrollbarClassName?: string;
}): import("react/jsx-runtime").JSX.Element;
