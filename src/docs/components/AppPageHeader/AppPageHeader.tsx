import { ReactNode } from 'react';

import { Logo } from '#uilib/components/ui/Logo';
import type { BreadcrumbItem } from '#uilib/components/ui/Page/Breadcrumbs/Breadcrumbs.types';
import { PageHeader } from '#uilib/components/ui/Page/PageHeader/PageHeader';

export function AppPageHeader({
  breadcrumbs,
  title,
  subheader,
  actions,
}: {
  breadcrumbs: BreadcrumbItem[];
  title: ReactNode;
  subheader: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <PageHeader
      title={title}
      subheader={subheader}
      actions={actions}
      breadcrumbClientLogo={<Logo size="sm" showText={false} />}
      breadcrumbCompanyName="Sybilion uilib"
      breadcrumbs={['client-name', ...breadcrumbs]}
    />
  );
}
