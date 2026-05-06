import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage as BreadcrumbPageCrumb,
  BreadcrumbSeparator,
} from '#uilib/components/ui/Breadcrumb';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function BreadcrumbPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Breadcrumb' }]}
        title="Breadcrumb"
        subheader="Inline navigation trail."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPageCrumb>Breadcrumb</BreadcrumbPageCrumb>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </PageContentSection>
    </>
  );
}
