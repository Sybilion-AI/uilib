import { useState } from 'react';

import { AnalysesSelector } from '#uilib/components/ui/AnalysesSelector';
import AnalysesSelectorGuidance from '#uilib/components/ui/AnalysesSelector/AGENT.md';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

const ITEMS = [
  { id: -1, label: 'Historical', color: 'var(--foreground)' },
  {
    id: 1,
    label: 'Analysis A',
    color: 'var(--chart-1)',
    status: 'done',
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    label: 'Analysis B',
    color: 'var(--chart-2)',
    status: 'done',
    updated_at: new Date().toISOString(),
  },
];

export default function AnalysesSelectorPage() {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    () => new Set([1]),
  );

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'AnalysesSelector' }]}
        title="AnalysesSelector"
        subheader="Multi-select analyses with inline or dropdown layout."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={AnalysesSelectorGuidance} />
      <PageContentSection style={{ maxWidth: 420 }}>
        <AnalysesSelector
          size="sm"
          items={ITEMS}
          selectedIds={selectedIds}
          onItemToggle={id => {
            setSelectedIds(prev => {
              const next = new Set(prev);
              if (next.has(id)) next.delete(id);
              else next.add(id);
              return next;
            });
          }}
          placeholder="Analyses"
        />
      </PageContentSection>
    </>
  );
}
