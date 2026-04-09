import { type ReactNode } from 'react';
import { SlashIcon } from 'lucide-react';
import type { BreadcrumbItem } from './Breadcrumbs.types';
export declare function Breadcrumbs({ className, items, children, clientLogo, companyName, 
/** When false, omits the nav menu trigger (use in shells without SidebarProvider). */
sidebarTrigger, }: {
    className?: string;
    items: BreadcrumbItem[];
    children?: ReactNode;
    /** Shown for the `client-name` crumb. */
    clientLogo?: ReactNode;
    companyName?: string;
    sidebarTrigger?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export declare const BreadCrumbsSeparator: ({ className, ...props }: React.ComponentProps<typeof SlashIcon>) => import("react/jsx-runtime").JSX.Element;
