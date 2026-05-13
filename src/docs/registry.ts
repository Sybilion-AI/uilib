import { ComponentType, LazyExoticComponent, lazy } from 'react';

export type DocEntry = {
  slug: string;
  title: string;
  section: string;
  load: () => Promise<{ default: ComponentType<object> }>;
};

/** Sidebar group order */
export const DOC_SECTION_ORDER = [
  'Forms',
  'Feedback',
  'Layout',
  'Navigation',
  'Overlays',
  'Data display',
  'Charts',
  'Chat',
  'Media',
  'Misc',
] as const;

export const DOC_DEFAULT_SLUG = 'button';

export const DOC_REGISTRY: DocEntry[] = [
  {
    slug: 'button',
    title: 'Button',
    section: 'Forms',
    load: () => import('./pages/ButtonPage'),
  },
  {
    slug: 'analyses-selector',
    title: 'AnalysesSelector',
    section: 'Data display',
    load: () => import('./pages/AnalysesSelectorPage'),
  },
  {
    slug: 'analysis-line-icon',
    title: 'AnalysisLineIcon',
    section: 'Data display',
    load: () => import('./pages/AnalysisLineIconPage'),
  },
  // {
  //   slug: 'app-header',
  //   title: 'AppHeader',
  //   section: 'Layout',
  //   load: () => import('./pages/AppHeaderPage'),
  // },
  {
    slug: 'avatar',
    title: 'Avatar',
    section: 'Data display',
    load: () => import('./pages/AvatarPage'),
  },
  {
    slug: 'badge',
    title: 'Badge',
    section: 'Data display',
    load: () => import('./pages/BadgePage'),
  },
  {
    slug: 'breadcrumb',
    title: 'Breadcrumb',
    section: 'Navigation',
    load: () => import('./pages/BreadcrumbPage'),
  },
  {
    slug: 'nav-user-header',
    title: 'NavUserHeader',
    section: 'Navigation',
    load: () => import('./pages/NavUserHeaderPage'),
  },
  {
    slug: 'card',
    title: 'Card',
    section: 'Layout',
    load: () => import('./pages/CardPage'),
  },
  {
    slug: 'chart',
    title: 'Chart',
    section: 'Charts',
    load: () => import('./pages/ChartPage'),
  },
  {
    slug: 'chart-area-interactive',
    title: 'ChartAreaInteractive',
    section: 'Charts',
    load: () => import('./pages/ChartAreaInteractivePage'),
  },
  {
    slug: 'chat',
    title: 'Chat',
    section: 'Chat',
    load: () => import('./pages/ChatPage'),
  },
  {
    slug: 'checkbox',
    title: 'Checkbox',
    section: 'Forms',
    load: () => import('./pages/CheckboxPage'),
  },
  {
    slug: 'dialog',
    title: 'Dialog',
    section: 'Overlays',
    load: () => import('./pages/DialogPage'),
  },
  {
    slug: 'drawer',
    title: 'Drawer',
    section: 'Overlays',
    load: () => import('./pages/DrawerPage'),
  },
  {
    slug: 'dropdown-menu',
    title: 'DropdownMenu',
    section: 'Overlays',
    load: () => import('./pages/DropdownMenuPage'),
  },
  {
    slug: 'drop-zone',
    title: 'DropZone',
    section: 'Forms',
    load: () => import('./pages/DropZonePage'),
  },
  {
    slug: 'flickering-grid',
    title: 'FlickeringGrid',
    section: 'Misc',
    load: () => import('./pages/FlickeringGridPage'),
  },
  {
    slug: 'foldable',
    title: 'Foldable',
    section: 'Layout',
    load: () => import('./pages/FoldablePage'),
  },
  {
    slug: 'image',
    title: 'Image',
    section: 'Media',
    load: () => import('./pages/ImagePage'),
  },
  {
    slug: 'image-with-fallback',
    title: 'ImageWithFallback',
    section: 'Media',
    load: () => import('./pages/ImageWithFallbackPage'),
  },
  {
    slug: 'input',
    title: 'Input',
    section: 'Forms',
    load: () => import('./pages/InputPage'),
  },
  {
    slug: 'interactive-content',
    title: 'InteractiveContent',
    section: 'Layout',
    load: () => import('./pages/InteractiveContentPage'),
  },
  {
    slug: 'sybilion-auth-layout',
    title: 'SybilionAuthLayout',
    section: 'Layout',
    load: () => import('./pages/SybilionAuthLayoutPage'),
  },
  {
    slug: 'label',
    title: 'Label',
    section: 'Forms',
    load: () => import('./pages/LabelPage'),
  },
  {
    slug: 'labeled-input',
    title: 'LabeledInput',
    section: 'Forms',
    load: () => import('./pages/LabeledInputPage'),
  },
  {
    slug: 'label-with-id',
    title: 'LabelWithId',
    section: 'Forms',
    load: () => import('./pages/LabelWithIdPage'),
  },
  {
    slug: 'legacy-platform-link',
    title: 'LegacyPlatformLink',
    section: 'Navigation',
    load: () => import('./pages/LegacyPlatformLinkPage'),
  },
  {
    slug: 'logo',
    title: 'Logo',
    section: 'Media',
    load: () => import('./pages/LogoPage'),
  },
  {
    slug: 'mobile-adaptive-selector',
    title: 'MobileAdaptiveSelector',
    section: 'Forms',
    load: () => import('./pages/MobileAdaptiveSelectorPage'),
  },
  {
    slug: 'number-control',
    title: 'NumberControl',
    section: 'Forms',
    load: () => import('./pages/NumberControlPage'),
  },
  {
    slug: 'page',
    title: 'Page',
    section: 'Layout',
    load: () => import('./pages/PagePage'),
  },
  {
    slug: 'standalone-app-layout',
    title: 'Standalone app layout',
    section: 'Layout',
    load: () =>
      import('./pages/StandaloneAppLayoutPage/StandaloneAppLayoutPage'),
  },
  {
    slug: 'progress',
    title: 'Progress',
    section: 'Feedback',
    load: () => import('./pages/ProgressPage'),
  },
  {
    slug: 'region-coords',
    title: 'RegionCoords',
    section: 'Forms',
    load: () => import('./pages/RegionCoordsPage'),
  },
  {
    slug: 'renamer',
    title: 'Renamer',
    section: 'Forms',
    load: () => import('./pages/RenamerPage'),
  },
  {
    slug: 'select',
    title: 'Select',
    section: 'Forms',
    load: () => import('./pages/SelectPage'),
  },
  {
    slug: 'separator',
    title: 'Separator',
    section: 'Layout',
    load: () => import('./pages/SeparatorPage'),
  },
  {
    slug: 'sheet',
    title: 'Sheet',
    section: 'Overlays',
    load: () => import('./pages/SheetPage'),
  },
  {
    slug: 'sidebar',
    title: 'Sidebar',
    section: 'Layout',
    load: () => import('./pages/SidebarPage'),
  },
  {
    slug: 'sidebar-datasets-items-grouped',
    title: 'SidebarDatasetsItemsGrouped',
    section: 'Navigation',
    load: () => import('./pages/SidebarDatasetsItemsGroupedPage'),
  },
  {
    slug: 'skeleton',
    title: 'Skeleton',
    section: 'Feedback',
    load: () => import('./pages/SkeletonPage'),
  },
  {
    slug: 'slider',
    title: 'Slider',
    section: 'Forms',
    load: () => import('./pages/SliderPage'),
  },
  {
    slug: 'smart-text-truncate',
    title: 'SmartTextTruncate',
    section: 'Data display',
    load: () => import('./pages/SmartTextTruncatePage'),
  },
  {
    slug: 'sparkline',
    title: 'Sparkline',
    section: 'Charts',
    load: () => import('./pages/SparklinePage'),
  },
  {
    slug: 'switch',
    title: 'Switch',
    section: 'Forms',
    load: () => import('./pages/SwitchPage'),
  },
  {
    slug: 'table',
    title: 'Table',
    section: 'Data display',
    load: () => import('./pages/TablePage'),
  },
  {
    slug: 'tabs',
    title: 'Tabs',
    section: 'Layout',
    load: () => import('./pages/TabsPage'),
  },
  {
    slug: 'text-shimmer',
    title: 'TextShimmer',
    section: 'Feedback',
    load: () => import('./pages/TextShimmerPage'),
  },
  {
    slug: 'text-with-defer-tooltip',
    title: 'TextWithDeferTooltip',
    section: 'Data display',
    load: () => import('./pages/TextWithDeferTooltipPage'),
  },
  {
    slug: 'time-range-controls',
    title: 'TimeRangeControls',
    section: 'Forms',
    load: () => import('./pages/TimeRangeControlsPage'),
  },
  {
    slug: 'toggle',
    title: 'Toggle',
    section: 'Forms',
    load: () => import('./pages/TogglePage'),
  },
  {
    slug: 'toggle-group',
    title: 'ToggleGroup',
    section: 'Forms',
    load: () => import('./pages/ToggleGroupPage'),
  },
  {
    slug: 'tooltip',
    title: 'Tooltip',
    section: 'Overlays',
    load: () => import('./pages/TooltipPage'),
  },
  {
    slug: 'vimeo-embed',
    title: 'VimeoEmbed',
    section: 'Media',
    load: () => import('./pages/VimeoEmbedPage'),
  },
];

export const docPageComponents: Record<
  string,
  LazyExoticComponent<ComponentType<object>>
> = Object.fromEntries(DOC_REGISTRY.map(e => [e.slug, lazy(e.load)]));
