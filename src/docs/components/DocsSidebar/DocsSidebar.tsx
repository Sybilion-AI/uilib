import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { Input } from '#uilib/components/ui/Input';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '#uilib/components/ui/Sidebar/Sidebar';
import { SmartTextTruncate } from '#uilib/components/ui/SmartTextTruncate';
import { ChevronDown, ChevronRight } from 'lucide-react';

import { DOC_REGISTRY, DOC_SECTION_ORDER } from '../../registry';
import S from './DocsSidebar.styl';

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
    <div>
      {isExpanded ? (
        <ChevronDown size={12} strokeWidth={1.5} />
      ) : (
        <ChevronRight size={12} strokeWidth={1.5} />
      )}
    </div>
  );
}

export function DocsSidebar() {
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
      setSidebarSearch('');
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
    <Sidebar
      variant="inset"
      collapsible="offcanvas"
      brandText="Sybilion Design"
    >
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
          <SidebarMenu>
            {DOC_SECTION_ORDER.map(section => {
              const entries = bySection.get(section);
              if (!entries?.length) return null;

              const filteredEntries = isFiltering
                ? entries.filter(e => entryMatchesQuery(e, q))
                : entries;
              if (!filteredEntries.length) return null;

              const isExpanded = isFiltering || expandedSections.has(section);
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
                    <span>
                      <SmartTextTruncate>{section}</SmartTextTruncate>
                    </span>
                    {isFiltering ? null : renderSectionChevron(isExpanded)}
                  </SidebarMenuButton>
                  {isExpanded ? (
                    <SidebarMenuSub>
                      {filteredEntries.map(e => {
                        const to = `/docs/${e.slug}`;
                        const isActive = location.pathname === to;
                        return (
                          <SidebarMenuSubItem key={e.slug}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isActive}
                              size="md"
                            >
                              <Link to={to}>
                                <SmartTextTruncate>{e.title}</SmartTextTruncate>
                              </Link>
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
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
