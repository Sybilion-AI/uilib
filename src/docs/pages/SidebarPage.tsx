import { PageContentSection } from '#uilib/components/ui/Page';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '#uilib/components/ui/Sidebar/Sidebar';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
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
