import cn from 'classnames';
import { useContext } from 'react';

import {
  BreadCrumbsSeparator,
  Breadcrumbs,
} from '#uilib/components/ui/Page/Breadcrumbs/Breadcrumbs';
import { BreadcrumbItem } from '#uilib/components/ui/Page/Breadcrumbs/Breadcrumbs.types';
import { PageContext } from '#uilib/components/ui/Page/pageContext';
import { TextWithDeferTooltip } from '#uilib/components/ui/TextWithDeferTooltip';

import S from './PageHeader.styl';

export function PageHeader({
  breadcrumbs,
  breadcrumbClientLogo,
  breadcrumbCompanyName,
  breadcrumbSidebarTrigger = true,
  title,
  subheader,
  actions,
}: {
  breadcrumbs?: BreadcrumbItem[];
  breadcrumbClientLogo?: React.ReactNode;
  breadcrumbCompanyName?: string;
  /** Set false when there is no SidebarProvider (e.g. docs / standalone pages). */
  breadcrumbSidebarTrigger?: boolean;
  title: React.ReactNode;
  subheader?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const { isScrolled } = useContext(PageContext);

  return (
    <div
      className={cn(S.root, actions && S.hasActions, isScrolled && S.scrolled)}
    >
      <div className={S.inner}>
        <Breadcrumbs
          className={S.breadcrumbs}
          items={breadcrumbs ?? []}
          clientLogo={breadcrumbClientLogo}
          companyName={breadcrumbCompanyName}
          sidebarTrigger={breadcrumbSidebarTrigger}
        >
          {isScrolled && (
            <div className={S.titleDupe}>
              <BreadCrumbsSeparator size={14} />
              {title}
            </div>
          )}
        </Breadcrumbs>
        <div className={S.main}>
          <div className={S.title}>
            <h1>{title}</h1>
            {subheader && (
              <TextWithDeferTooltip className={S.subheader} overTrigger>
                {subheader}
              </TextWithDeferTooltip>
            )}
          </div>
          {actions && <div className={S.actions}>{actions}</div>}
        </div>
      </div>
    </div>
  );
}
