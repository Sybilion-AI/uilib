import cn from 'classnames';

import { PageXScroll } from '#uilib/components/ui/Page/PageXScroll/PageXScroll';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsListProps,
  TabsProps,
  TabsTrigger,
} from '#uilib/components/ui/Tabs';

import S from './PageTabs.styl';

function hasTabPanelContent(content: React.ReactNode | undefined): boolean {
  if (content == null) return false;
  if (typeof content === 'boolean') return false;
  if (Array.isArray(content) && content.length === 0) return false;
  if (content === '') return false;
  return true;
}

export function PageTabs({
  className,
  contentClassName,
  items,
  tabsListProps,
  ...props
}: {
  items: { value: string; label: string; content?: React.ReactNode }[];
  tabsListProps?: TabsListProps & {
    fullWidth?: boolean;
    withPaddings?: boolean;
  };
} & TabsProps & { contentClassName?: string }) {
  return (
    <Tabs className={cn(S.root, className)} variant="link" {...props}>
      <TabsList
        {...tabsListProps}
        className={cn(S.list, tabsListProps?.withPaddings && S.withPaddings)}
      >
        <PageXScroll size="sm" scrollbarClassName={S.scrollbar}>
          {items.map(item => (
            <TabsTrigger value={item.value} key={item.value}>
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
