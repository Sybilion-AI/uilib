import cn from 'classnames';
import { Link } from 'react-router-dom';
import { Fragment, type ReactNode } from 'react';

import { SidebarTrigger } from '@/components/ui/Sidebar/Sidebar';
import { SlashIcon } from 'lucide-react';

import S from './Breadcrumbs.styl';
import type { BreadcrumbItem } from './Breadcrumbs.types';

export function Breadcrumbs({
  className,
  items,
  children,
  clientLogo,
  companyName,
  /** When false, omits the nav menu trigger (use in shells without SidebarProvider). */
  sidebarTrigger = true,
}: {
  className?: string;
  items: BreadcrumbItem[];
  children?: ReactNode;
  /** Shown for the `client-name` crumb. */
  clientLogo?: ReactNode;
  companyName?: string;
  sidebarTrigger?: boolean;
}) {
  const renderItem = (item: BreadcrumbItem, index: number) => {
    if (item === 'client-name') {
      return (
        <div className={S.item} key={index}>
          {clientLogo}
          {companyName}
        </div>
      );
    }

    return (
      <Fragment key={index}>
        {index > 0 && <BreadCrumbsSeparator />}
        {item.href ? (
          <Link className={S.item} to={item.href}>
            {item.label}
          </Link>
        ) : (
          <div className={S.item}>{item.label}</div>
        )}
      </Fragment>
    );
  };

  return (
    <div className={cn(S.root, className)}>
      {sidebarTrigger && (
        <>
          <SidebarTrigger />
          <BreadCrumbsSeparator />
        </>
      )}
      {items.map(renderItem)}
      {children}
    </div>
  );
}

export const BreadCrumbsSeparator = ({
  className,
  ...props
}: React.ComponentProps<typeof SlashIcon>) => (
  <SlashIcon className={cn(S.separator, className)} {...props} />
);
