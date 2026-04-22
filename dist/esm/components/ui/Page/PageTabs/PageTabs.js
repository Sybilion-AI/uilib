import { jsxs, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { PageXScroll } from '../PageXScroll/PageXScroll.js';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../Tabs/Tabs.js';
import S from './PageTabs.styl.js';

function hasTabPanelContent(content) {
    if (content == null)
        return false;
    if (typeof content === 'boolean')
        return false;
    if (Array.isArray(content) && content.length === 0)
        return false;
    if (content === '')
        return false;
    return true;
}
function PageTabs({ className, contentClassName, items, tabsListProps, ...props }) {
    return (jsxs(Tabs, { className: cn(S.root, className), variant: "link", ...props, children: [jsx(TabsList, { ...tabsListProps, className: cn(S.list, tabsListProps?.withPaddings && S.withPaddings), children: jsx(PageXScroll, { size: "sm", scrollbarClassName: S.scrollbar, children: items.map(item => (jsx(TabsTrigger, { value: item.value, children: item.label }, item.value))) }) }), items.map(item => hasTabPanelContent(item.content) ? (jsx(TabsContent, { value: item.value, className: cn(S.content, contentClassName), children: item.content }, item.value)) : null)] }));
}

export { PageTabs };
