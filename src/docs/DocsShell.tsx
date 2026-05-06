import { useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

import { Input } from '#uilib/components/ui/Input';
import { PageFooter } from '#uilib/components/ui/Page/PageFooter/PageFooter';
import { PageMainContent } from '#uilib/components/ui/Page/PageMainContent/PageMainContent';
import { PageScroll } from '#uilib/components/ui/Page/PageScroll/PageScroll';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '#uilib/components/ui/Sidebar/Sidebar';
import { ChevronDown, ChevronRight } from 'lucide-react';

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

function sectionForPathname(pathname: string): string | null {
  const slug = pathname.match(/\/docs\/([^/]+)/)?.[1];
  if (!slug) return null;
  return DOC_REGISTRY.find(e => e.slug === slug)?.section ?? null;
}

function entryMatchesQuery(
  entry: (typeof DOC_REGISTRY)[number],
  q: string,
): boolean {
  return (
    entry.title.toLowerCase().includes(q) ||
    entry.slug.toLowerCase().includes(q)
  );
}

function renderSectionChevron(isExpanded: boolean) {
  return (
    <div className={S.chevronContainer}>
      {isExpanded ? (
        <ChevronDown size={12} strokeWidth={1.5} />
      ) : (
        <ChevronRight size={12} strokeWidth={1.5} />
      )}
    </div>
  );
}

export function DocsShell() {
  const location = useLocation();
  const bySection = entriesBySection();
  const [sidebarSearch, setSidebarSearch] = useState('');
  const q = sidebarSearch.trim().toLowerCase();
  const isFiltering = q.length > 0;

  const activeSection = useMemo(
    () => sectionForPathname(location.pathname),
    [location.pathname],
  );

  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    const sec = sectionForPathname(location.pathname);
    return sec ? new Set([sec]) : new Set();
  });

  useEffect(() => {
    if (activeSection) {
      setExpandedSections(prev => new Set(prev).add(activeSection));
    }
  }, [activeSection]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  return (
    <PageScroll className={S.root}>
      <div className={S.shell}>
        <aside className={S.areaSidebar}>
          <Sidebar variant="inset" collapsible="offcanvas">
            <SidebarContent>
              <SidebarMenu className={S.sidebarSearch}>
                <Input
                  size="sm"
                  type="search"
                  placeholder="Search…"
                  aria-label="Filter docs navigation"
                  value={sidebarSearch}
                  onChange={e => setSidebarSearch(e.target.value)}
                />
              </SidebarMenu>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {DOC_SECTION_ORDER.map(section => {
                      const entries = bySection.get(section);
                      if (!entries?.length) return null;

                      const filteredEntries = isFiltering
                        ? entries.filter(e => entryMatchesQuery(e, q))
                        : entries;
                      if (!filteredEntries.length) return null;

                      const isExpanded =
                        isFiltering || expandedSections.has(section);
                      const sectionHasActive = entries.some(
                        e => location.pathname === `/docs/${e.slug}`,
                      );

                      return (
                        <SidebarMenuItem key={section}>
                          <SidebarMenuButton
                            type="button"
                            onClick={() => {
                              if (!isFiltering) toggleSection(section);
                            }}
                            isActive={sectionHasActive}
                          >
                            <span>{section}</span>
                            {isFiltering
                              ? null
                              : renderSectionChevron(isExpanded)}
                          </SidebarMenuButton>
                          {isExpanded ? (
                            <SidebarMenuSub className={S.subMenu}>
                              {filteredEntries.map(e => {
                                const to = `/docs/${e.slug}`;
                                const isActive = location.pathname === to;
                                return (
                                  <SidebarMenuSubItem
                                    key={e.slug}
                                    className={S.subMenuItem}
                                  >
                                    <SidebarMenuSubButton
                                      asChild
                                      isActive={isActive}
                                      size="md"
                                    >
                                      <Link to={to}>{e.title}</Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                );
                              })}
                            </SidebarMenuSub>
                          ) : null}
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </aside>
        <PageMainContent
          className={S.areaMain}
          footer={
            <PageFooter
              logo={<LogoSvg />}
              versionLink="/releases"
              versionLabel="1.0.0-docs"
            />
          }
        >
          <Outlet />
        </PageMainContent>
      </div>
    </PageScroll>
  );
}
