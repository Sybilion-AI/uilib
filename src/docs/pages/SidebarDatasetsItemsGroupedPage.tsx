import { useState } from 'react';

import { PageContentSection } from '#uilib/components/ui/Page';
import { ToggleGroup, ToggleGroupItem } from '#uilib/components/ui/ToggleGroup';
import {
  type SidebarDatasetsItemsGroupBy,
  SidebarDatasetsItemsGrouped,
  type SidebarDatasetsItemsGroupedDataset,
} from '#uilib/components/widgets/SidebarDatasetsItemsGrouped';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

const MOCK_DATASETS: SidebarDatasetsItemsGroupedDataset[] = [
  {
    id: 1,
    name: 'Acetic Acid Price - China - Dollar/MT',
    status: 'active',
    created_at: '2024-01-01',
    updated_at: '2024-01-02',
    keywords: '',
    category: { id: 10, name: 'Chemicals' },
    target_type_id: 1,
    target_type: { id: 1, name: 'Commodity price' },
    trend: 0,
    regular_price: '0',
    sale_price: '0',
    regions: [
      { id: 1, name: 'Asia' },
      { id: 2, name: 'China' },
    ],
    unit: { id: 1, name: 'USD/MT' },
  },
  {
    id: 2,
    name: 'Freight index — spot volume (China)',
    status: 'active',
    created_at: '2024-01-01',
    updated_at: '2024-01-02',
    keywords: '',
    category: { id: 10, name: 'Chemicals' },
    target_type_id: 2,
    target_type: { id: 2, name: 'Freight index' },
    trend: 0,
    regular_price: '0',
    sale_price: '0',
    regions: [
      { id: 1, name: 'Asia' },
      { id: 2, name: 'China' },
    ],
    unit: { id: 1, name: 'Index' },
  },
  {
    id: 3,
    name: 'Generic industrial chemical — spot volume (Germany)',
    status: 'active',
    created_at: '2024-01-01',
    updated_at: '2024-01-02',
    keywords: '',
    category: { id: 10, name: 'Chemicals' },
    target_type_id: 1,
    target_type: { id: 1, name: 'Commodity price' },
    trend: 0,
    regular_price: '0',
    sale_price: '0',
    regions: [
      { id: 3, name: 'Europe' },
      { id: 4, name: 'Germany' },
    ],
    unit: { id: 1, name: 'MT' },
  },
  {
    id: 4,
    name: 'Ethanol Price Europe Per Kg In USD',
    status: 'active',
    created_at: '2024-01-01',
    updated_at: '2024-01-02',
    keywords: '',
    category: { id: 11, name: 'Energy' },
    target_type_id: 1,
    target_type: { id: 1, name: 'Commodity price' },
    trend: 0,
    regular_price: '0',
    sale_price: '0',
    regions: [{ id: 5, name: 'Europe' }],
    unit: { id: 1, name: 'USD/kg' },
  },
];

export default function SidebarDatasetsItemsGroupedPage() {
  const [groupBy, setGroupBy] =
    useState<SidebarDatasetsItemsGroupBy>('regions');
  const [selectedDatasetId, setSelectedDatasetId] = useState<number>(1);

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'SidebarDatasetsItemsGrouped' }]}
        title="SidebarDatasetsItemsGrouped"
        subheader="Datasets sidebar: collapsible groups and nested rows."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance
        overview="SidebarDatasetsItemsGrouped renders a dataset list for the application sidebar, organised into collapsible groups with nested rows. The groupBy prop switches grouping between target type, regions, and categories, and selection is controlled through selectedDatasetId and onDatasetClick."
        whenToUse={[
          'In a sidebar that lists many datasets which benefit from grouping by a shared attribute.',
          'When the user needs to switch between grouping dimensions without losing their selection.',
        ]}
        whenNotToUse={[
          'For short, flat lists; plain Sidebar menu items are simpler.',
          'Outside a sidebar surface; the widget assumes sidebar colours and spacing.',
        ]}
      />
      <PageContentSection>
        <ToggleGroup
          type="single"
          value={groupBy}
          onValueChange={val => {
            if (val) setGroupBy(val as SidebarDatasetsItemsGroupBy);
          }}
        >
          <ToggleGroupItem value="target_type">Target type</ToggleGroupItem>
          <ToggleGroupItem value="regions">Regions</ToggleGroupItem>
          <ToggleGroupItem value="categories">Categories</ToggleGroupItem>
        </ToggleGroup>
        <div
          style={{
            maxWidth: 420,
            marginTop: 16,
            padding: 12,
            background: 'var(--sidebar)',
            color: 'var(--sidebar-foreground)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--p-4)',
          }}
        >
          <SidebarDatasetsItemsGrouped
            groupBy={groupBy}
            datasets={MOCK_DATASETS}
            selectedDatasetId={selectedDatasetId}
            onDatasetClick={setSelectedDatasetId}
          />
        </div>
      </PageContentSection>
    </>
  );
}
