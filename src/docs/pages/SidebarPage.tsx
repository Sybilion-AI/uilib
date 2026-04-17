import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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
      <div
        style={{
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: 12,
          maxWidth: 280,
          background: 'var(--sidebar)',
          color: 'var(--sidebar-foreground)',
        }}
      >
        <SidebarGroup>
          <SidebarGroupLabel>Demo</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton type="button" isActive>
                  Active item
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton type="button">
                  Another item
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </div>
    </>
  );
}
