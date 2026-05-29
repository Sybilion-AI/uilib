import cn from 'classnames';

import { PageXScroll } from '#uilib/components/ui/Page/PageXScroll/PageXScroll';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsListProps,
  TabsProps,
  TabsTrigger,
  type TabsVariant,
} from '#uilib/components/ui/Tabs';

import S from './PageTabs.styl';

function hasTabPanelContent(content: React.ReactNode | undefined): boolean {
  if (content == null) return false;
  if (typeof content === 'boolean') return false;
  if (Array.isArray(content) && content.length === 0) return false;
  if (content === '') return false;
  return true;
}

export type PageTabsItem = {
  value: string;
  label: React.ReactNode;
  content?: React.ReactNode;
  /** React list key when multiple items may share `value`. */
  key?: string;
};

export function PageTabs({
  className,
  contentClassName,
  innerClassName,
  scrollbarClassName,
  items,
  tabsListProps,
  variant = 'link',
  ...props
}: {
  items: PageTabsItem[];
  tabsListProps?: TabsListProps & {
    fullWidth?: boolean;
    withPaddings?: boolean;
  };
  variant?: TabsVariant;
} & TabsProps & {
    contentClassName?: string;
    innerClassName?: string;
    scrollbarClassName?: string;
  }) {
  return (
    <Tabs
      className={cn(S.root, S[`variant-${variant}`], className)}
      variant={variant}
      {...props}
    >
      <TabsList
        {...tabsListProps}
        className={cn(S.list, tabsListProps?.withPaddings && S.withPaddings)}
      >
        <PageXScroll
          size="sm"
          scrollbarClassName={cn(S.scrollbar, scrollbarClassName)}
          innerClassName={cn(innerClassName, S.listInner)}
        >
          {items.map((item, index) => (
            <TabsTrigger
              value={item.value}
              key={item.key ?? `${item.value}-${index}`}
            >
              {item.label}
            </TabsTrigger>
          ))}
        </PageXScroll>
      </TabsList>

      {items.map(item =>
        hasTabPanelContent(item.content) ? (
          <TabsContent
            value={item.value}
            key={item.value}
            className={cn(S.content, contentClassName)}
          >
            {item.content}
          </TabsContent>
        ) : null,
      )}
    </Tabs>
  );
}
