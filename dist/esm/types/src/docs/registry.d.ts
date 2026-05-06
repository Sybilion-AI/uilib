import { ComponentType, LazyExoticComponent } from 'react';
export type DocEntry = {
    slug: string;
    title: string;
    section: string;
    load: () => Promise<{
        default: ComponentType<object>;
    }>;
};
/** Sidebar group order */
export declare const DOC_SECTION_ORDER: readonly ["Forms", "Feedback", "Layout", "Navigation", "Overlays", "Data display", "Charts", "Chat", "Media", "Misc"];
export declare const DOC_DEFAULT_SLUG = "button";
export declare const DOC_REGISTRY: DocEntry[];
export declare const docPageComponents: Record<string, LazyExoticComponent<ComponentType<object>>>;
