import { PageContentSection } from '#uilib/components/ui/Page';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '#uilib/components/ui/Sidebar/Sidebar';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function SidebarPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Sidebar' }]}
        title="Sidebar"
        subheader="Sidebar menu primitives (isolated preview)."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance
        overview="Sidebar provides the primitives for building application navigation rails: SidebarGroup, SidebarMenu, SidebarMenuItem, and SidebarMenuButton. Compose them to create grouped menus with active-state styling."
        whenToUse={[
          'To build the primary navigation of an application shell.',
          'When menu items need consistent hover, focus, and active styling on a sidebar surface.',
        ]}
        whenNotToUse={[
          'For in-page navigation such as tabs or table of contents; use PageTabs or links.',
          'For contextual action menus; use DropdownMenu.',
        ]}
        doNotes={[
          'Mark the current route’s item with isActive so users can orient themselves.',
        ]}
      />
      <PageContentSection>
        <SidebarGroup
          style={{
            maxWidth: 320,
            padding: 12,
            background: 'var(--sidebar)',
            color: 'var(--sidebar-foreground)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--p-4)',
          }}
        >
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton type="button" isActive>
                Active item
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton type="button">Another item</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </PageContentSection>
    </>
  );
}
