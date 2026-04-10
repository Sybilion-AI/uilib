import { jsx, jsxs } from 'react/jsx-runtime';
import cn from 'classnames';
import { useContext } from 'react';
import { Breadcrumbs, BreadCrumbsSeparator } from '../Breadcrumbs/Breadcrumbs.js';
import { PageContext } from '../pageContext.js';
import { TextWithDeferTooltip } from '../../TextWithDeferTooltip/TextWithDeferTooltip.js';
import S from './PageHeader.styl.js';

function PageHeader({ breadcrumbs, breadcrumbClientLogo, breadcrumbCompanyName, breadcrumbSidebarTrigger = true, title, subheader, actions, }) {
    const { isScrolled } = useContext(PageContext);
    return (jsx("div", { className: cn(S.root, actions && S.hasActions, isScrolled && S.scrolled), children: jsxs("div", { className: S.inner, children: [jsx(Breadcrumbs, { className: S.breadcrumbs, items: breadcrumbs ?? [], clientLogo: breadcrumbClientLogo, companyName: breadcrumbCompanyName, sidebarTrigger: breadcrumbSidebarTrigger, children: isScrolled && (jsxs("div", { className: S.titleDupe, children: [jsx(BreadCrumbsSeparator, { size: 14 }), title] })) }), jsxs("div", { className: S.main, children: [jsxs("div", { className: S.title, children: [jsx("h1", { children: title }), subheader && (jsx(TextWithDeferTooltip, { className: S.subheader, children: subheader }))] }), actions && jsx("div", { className: S.actions, children: actions })] })] }) }));
}

export { PageHeader };
