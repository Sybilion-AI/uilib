import { Link, Outlet, useLocation } from 'react-router-dom';

import { PageFooter } from '#uilib/components/ui/Page/PageFooter/PageFooter';
import { PageScroll } from '#uilib/components/ui/Page/PageScroll/PageScroll';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '#uilib/components/ui/Sidebar/Sidebar';

import LogoSvg from '../../assets/logo.svg';
import S from './DocsShell.styl';
import { DOC_REGISTRY, DOC_SECTION_ORDER } from './registry';

function entriesBySection() {
  const map = new Map<string, typeof DOC_REGISTRY>();
  for (const entry of DOC_REGISTRY) {
    const list = map.get(entry.section) ?? [];
    list.push(entry);
    map.set(entry.section, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.title.localeCompare(b.title));
  }
  return map;
}

export function DocsShell() {
  const location = useLocation();
  const bySection = entriesBySection();

  return (
    <PageScroll className={S.root}>
      <div className={S.shell}>
        <aside className={S.areaSidebar}>
          <Sidebar variant="inset" collapsible="offcanvas">
            <SidebarContent>
              {DOC_SECTION_ORDER.map(section => {
                const entries = bySection.get(section);
                if (!entries?.length) return null;
                return (
                  <SidebarGroup key={section}>
                    <SidebarGroupLabel>{section}</SidebarGroupLabel>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {entries.map(e => {
                          const to = `/docs/${e.slug}`;
                          const isActive = location.pathname === to;
                          return (
                            <SidebarMenuItem key={e.slug}>
                              <SidebarMenuButton asChild isActive={isActive}>
                                <Link to={to}>{e.title}</Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                );
              })}
            </SidebarContent>
          </Sidebar>
        </aside>
        <div className={S.areaMain}>
          <Outlet />
        </div>
      </div>
      <div className={S.footerSlot}>
        <PageFooter
          logo={<LogoSvg />}
          versionLink="/releases"
          versionLabel="1.0.0-docs"
        >
          <p>uilib docs — local preview.</p>
        </PageFooter>
      </div>
    </PageScroll>
  );
}
