import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { Fragment as Fragment$1 } from 'react';
import { Link } from 'react-router-dom';
import { SidebarTrigger } from '../../Sidebar/Sidebar.js';
import { SlashIcon } from 'lucide-react';
import S from './Breadcrumbs.styl.js';

function Breadcrumbs({ className, items, children, clientLogo, companyName, 
/** When false, omits the nav menu trigger (use in shells without SidebarProvider). */
sidebarTrigger = true, }) {
    const renderItem = (item, index) => {
        if (item === 'client-name') {
            return (jsxs("div", { className: S.item, children: [clientLogo, companyName] }, index));
        }
        return (jsxs(Fragment$1, { children: [index > 0 && jsx(BreadCrumbsSeparator, {}), item.href ? (jsx(Link, { className: S.item, to: item.href, children: item.label })) : (jsx("div", { className: S.item, children: item.label }))] }, index));
    };
    return (jsxs("div", { className: cn(S.root, className), children: [sidebarTrigger && (jsxs(Fragment, { children: [jsx(SidebarTrigger, {}), jsx(BreadCrumbsSeparator, {})] })), items.map(renderItem), children] }));
}
const BreadCrumbsSeparator = ({ className, ...props }) => (jsx(SlashIcon, { className: cn(S.separator, className), ...props }));

export { BreadCrumbsSeparator, Breadcrumbs };
