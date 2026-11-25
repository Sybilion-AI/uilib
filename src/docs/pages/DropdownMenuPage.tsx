import { useState } from 'react';

import { Button } from '#uilib/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '#uilib/components/ui/DropdownMenu';
import DropdownMenuGuidance from '#uilib/components/ui/DropdownMenu/AGENT.md';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

const FILTER_OPTIONS = [
  {
    key: 'product',
    label: 'Product',
    options: ['Resin A', 'Steel coil', 'Copper wire'],
  },
  {
    key: 'supplier',
    label: 'Supplier',
    options: ['Company A', 'Company B', 'Company C'],
  },
  { key: 'customer', label: 'Customer', options: ['Company D', 'Company E'] },
] as const;

type FilterKey = (typeof FILTER_OPTIONS)[number]['key'];

const DATE_RANGES = [
  'Last 7 days',
  'Last 30 days',
  'Last 90 days',
  'This year',
];

function FilterByMenu() {
  const [selected, setSelected] = useState<Record<FilterKey, string[]>>({
    product: [],
    supplier: [],
    customer: [],
  });
  const [dateRange, setDateRange] = useState(DATE_RANGES[1]);

  const toggle = (key: FilterKey, option: string, checked: boolean) =>
    setSelected(prev => ({
      ...prev,
      [key]: checked
        ? [...prev[key], option]
        : prev[key].filter(o => o !== option),
    }));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline">
          Filter by
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {FILTER_OPTIONS.map(({ key, label, options }) => (
          <DropdownMenuSub key={key}>
            <DropdownMenuSubTrigger>{label}</DropdownMenuSubTrigger>
            {/* SubContent is not portalled by default; inside the parent's
                scroll box it would be clipped, so wrap it in a portal. */}
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {options.map(option => (
                  <DropdownMenuCheckboxItem
                    key={option}
                    checked={selected[key].includes(option)}
                    onCheckedChange={checked =>
                      toggle(key, option, checked === true)
                    }
                    onSelect={e => e.preventDefault()}
                  >
                    {option}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        ))}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Date range</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={dateRange}
                onValueChange={setDateRange}
              >
                {DATE_RANGES.map(range => (
                  <DropdownMenuRadioItem
                    key={range}
                    value={range}
                    onSelect={e => e.preventDefault()}
                  >
                    {range}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function DropdownMenuPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'DropdownMenu' }]}
        title="DropdownMenu"
        subheader="Context menu with items."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={DropdownMenuGuidance} />
      <PageContentSection
        style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
      >
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Basic</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline">
                Open menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => {}}>Item one</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => {}}>Item two</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </section>
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Nested (sub-menus)</h3>
          <FilterByMenu />
        </section>
      </PageContentSection>
    </>
  );
}
