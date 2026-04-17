import { ReactNode } from 'react';
import type { BreadcrumbItem } from '#uilib/components/ui/Page/Breadcrumbs/Breadcrumbs.types';
export declare function AppPageHeader({ breadcrumbs, title, subheader, actions, }: {
    breadcrumbs: BreadcrumbItem[];
    title: ReactNode;
    subheader: ReactNode;
    actions?: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
