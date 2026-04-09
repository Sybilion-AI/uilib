import { BreadcrumbItem } from '#uilib/components/ui/Page/Breadcrumbs/Breadcrumbs.types';
export declare function PageHeader({ breadcrumbs, breadcrumbClientLogo, breadcrumbCompanyName, breadcrumbSidebarTrigger, title, subheader, actions, }: {
    breadcrumbs?: BreadcrumbItem[];
    breadcrumbClientLogo?: React.ReactNode;
    breadcrumbCompanyName?: string;
    /** Set false when there is no SidebarProvider (e.g. docs / standalone pages). */
    breadcrumbSidebarTrigger?: boolean;
    title: React.ReactNode;
    subheader?: React.ReactNode;
    actions?: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
