import { AnalysesSelector } from '#uilib/components/ui/AnalysesSelector';
import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';
import { PageContentSection } from '#uilib/components/ui/Page';
import { useState } from 'react';

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
      <DocsGuidance
        overview="AnalysesSelector lets users choose which analyses are shown alongside historical data, rendered as an inline row or a compact dropdown depending on available space. Each item carries a colour swatch and optional status so users can match selections to chart series."
        whenToUse={[
          'To toggle which analysis series are visible on a chart or comparison view.',
          'When users need to compare several analyses against historical data at once.',
          'When the selection should collapse into a dropdown in constrained layouts.',
        ]}
        whenNotToUse={[
          'To pick a single value from a generic list; use Select instead.',
          'To filter tabular data by arbitrary fields; use dedicated filter controls.',
        ]}
        doNotes={[
          'Keep item colours in sync with the corresponding chart series so the mapping stays obvious.',
        ]}
      />
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
