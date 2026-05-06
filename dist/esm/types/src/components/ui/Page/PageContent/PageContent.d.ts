export declare function PageContent({ className, children, variant, }: {
    className?: string;
    children: React.ReactNode;
    variant?: 'default' | 'clean';
}): import("react/jsx-runtime").JSX.Element;
export declare function PageContentSection({ className, children, ...rest }: {
    className?: string;
    children: React.ReactNode;
} & Omit<React.ComponentProps<'div'>, 'className' | 'children'>): import("react/jsx-runtime").JSX.Element;
