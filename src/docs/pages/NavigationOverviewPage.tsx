import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage as BreadcrumbPageCrumb,
  BreadcrumbSeparator,
} from '#uilib/components/ui/Breadcrumb';
import { DropdownMenuItem } from '#uilib/components/ui/DropdownMenu';
import { LegacyPlatformLink } from '#uilib/components/ui/LegacyPlatformLink';
import { NavUserHeader } from '#uilib/components/ui/NavUserHeader';
import { PageContentSection } from '#uilib/components/ui/Page';
import { GearSixIcon, UserCircleIcon } from '@phosphor-icons/react';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

const panelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  padding: 'var(--p-3)',
  borderRadius: 'var(--radius-3)',
};

export default function NavigationOverviewPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Overview' }]}
        title="Overview"
        subheader="Trails, user menus, and cross-platform links."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection
        style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}
      >
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Breadcrumb</h3>
          <div style={panelStyle}>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPageCrumb>Navigation</BreadcrumbPageCrumb>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>NavUserHeader</h3>
          <div style={panelStyle}>
            <NavUserHeader
              user={{
                name: 'Demo Analyst',
                email: 'demo@sybilion.io',
                avatar: '',
              }}
              onLogout={() => {
                console.info('[docs] logout');
              }}
              menuItems={
                <>
                  <DropdownMenuItem>
                    <UserCircleIcon />
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <GearSixIcon />
                    Settings
                  </DropdownMenuItem>
                </>
              }
            />
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>LegacyPlatformLink</h3>
          <div style={panelStyle}>
            <LegacyPlatformLink redirectPath="/v1/dashboard">
              Legacy platform link
            </LegacyPlatformLink>
          </div>
        </section>
      </PageContentSection>
    </>
  );
}
