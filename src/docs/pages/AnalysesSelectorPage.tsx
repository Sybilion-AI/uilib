import { useState } from 'react';

import { AnalysesSelector } from '#uilib/components/ui/AnalysesSelector';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
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
      <div style={{ maxWidth: 420 }}>
        <AnalysesSelector
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
      </div>
    </>
  );
}
