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
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
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
      <DocsGuidance
        overview="Breadcrumb shows the user’s location within the page hierarchy as an inline trail of links, with the current page rendered as plain text. Compose it from BreadcrumbList, BreadcrumbItem, BreadcrumbLink, and BreadcrumbSeparator."
        whenToUse={[
          'On pages nested two or more levels deep, so users can move back up the hierarchy.',
          'When users arrive deep in the product from search or a direct link and need orientation.',
        ]}
        whenNotToUse={[
          'On top-level pages with no parent; a trail with one item adds noise.',
          'As a substitute for primary navigation or a stepper in a multi-step flow.',
        ]}
        doNotes={[
          'Render the current page with BreadcrumbPage rather than a link so it is not clickable.',
        ]}
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
