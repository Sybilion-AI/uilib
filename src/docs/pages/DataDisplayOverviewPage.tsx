import { useState } from 'react';

import { AnalysesSelector } from '#uilib/components/ui/AnalysesSelector';
import { AnalysisLineIcon } from '#uilib/components/ui/AnalysisLineIcon';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '#uilib/components/ui/Avatar';
import { Chip } from '#uilib/components/ui/Chip';
import { FileChip } from '#uilib/components/ui/FileChip';
import { Kicker } from '#uilib/components/ui/Kicker';
import { PageContentSection } from '#uilib/components/ui/Page';
import { PullQuote } from '#uilib/components/ui/PullQuote';
import { SmartTextTruncate } from '#uilib/components/ui/SmartTextTruncate';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#uilib/components/ui/Table';
import { TextWithDeferTooltip } from '#uilib/components/ui/TextWithDeferTooltip';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

const SAMPLE_ROWS = [
  { name: 'Ada', role: 'Admin', status: 'Active' },
  { name: 'Bob', role: 'Viewer', status: 'Active' },
  { name: 'Cara', role: 'Editor', status: 'Invited' },
] as const;

const ANALYSES_ITEMS = [
  { id: -1, label: 'Historical', color: 'var(--foreground)' },
  {
    id: 1,
    label: 'Analysis A',
    color: 'var(--chart-1)',
    status: 'done' as const,
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    label: 'Analysis B',
    color: 'var(--chart-2)',
    status: 'done' as const,
    updated_at: new Date().toISOString(),
  },
];

const LONG_TRUNCATE_LABEL =
  'Impact — Impact Report: Professional Beauty Segment Analysis Constraints Index';

const LONG_TOOLTIP_LABEL =
  'This is a long label that should overflow and show a tooltip on hover.';

const panelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  padding: 'var(--p-3)',
  borderRadius: 'var(--radius-3)',
};

export default function DataDisplayOverviewPage() {
  const [selectedAnalysisIds, setSelectedAnalysisIds] = useState<Set<number>>(
    () => new Set([1]),
  );

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Overview' }]}
        title="Overview"
        subheader="Avatars, labels, chips, and tabular data."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection
        style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}
      >
        <section>
          <h3 style={{ marginBottom: '1rem' }}>AnalysesSelector</h3>
          <div style={{ ...panelStyle, maxWidth: 420 }}>
            <AnalysesSelector
              size="sm"
              items={ANALYSES_ITEMS}
              selectedIds={selectedAnalysisIds}
              onItemToggle={id => {
                setSelectedAnalysisIds(prev => {
                  const next = new Set(prev);
                  if (next.has(id)) next.delete(id);
                  else next.add(id);
                  return next;
                });
              }}
              placeholder="Analyses"
            />
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>AnalysisLineIcon</h3>
          <div
            style={{
              ...panelStyle,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <AnalysisLineIcon color="var(--chart-1)" variant="solid" />
            <AnalysisLineIcon color="var(--chart-2)" variant="dashed" />
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>Avatar</h3>
          <div
            style={{
              ...panelStyle,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>AB</AvatarFallback>
            </Avatar>
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>Chip</h3>
          <div
            style={{
              ...panelStyle,
              flexDirection: 'row',
              flexWrap: 'wrap',
            }}
          >
            <Chip variant="neutral">Neutral</Chip>
            <Chip variant="positive">Positive</Chip>
            <Chip variant="negative">Negative</Chip>
            <Chip variant="accent">Accent</Chip>
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>FileChip</h3>
          <div style={{ ...panelStyle, alignItems: 'flex-start' }}>
            <FileChip name="report.pdf" format="pdf" hint="PDF" />
            <FileChip
              name="notes.txt"
              format="text"
              hint="Text file"
              onRemove={() => {}}
            />
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>Table</h3>
          <div style={panelStyle}>
            <Table size="md">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SAMPLE_ROWS.map(row => (
                  <TableRow key={row.name}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.role}</TableCell>
                    <TableCell>{row.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>Kicker</h3>
          <div style={panelStyle}>
            <Kicker dash>Quarterly outlook</Kicker>
            <h2 style={{ marginTop: '0.5rem', marginBottom: 0 }}>
              Polymer demand
            </h2>
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>PullQuote</h3>
          <div style={panelStyle}>
            <PullQuote
              attribution="Marta Linden"
              attributionRole="Head of procurement"
            >
              Forecasts are only useful when they arrive before the decision.
            </PullQuote>
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>SmartTextTruncate</h3>
          <div
            style={{
              ...panelStyle,
              width: 240,
              border: '1px solid var(--border)',
            }}
          >
            <SmartTextTruncate style={{ display: 'block', width: '100%' }}>
              {LONG_TRUNCATE_LABEL}
            </SmartTextTruncate>
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>TextWithDeferTooltip</h3>
          <div
            style={{
              ...panelStyle,
              maxWidth: 120,
              border: '1px dashed var(--border)',
            }}
          >
            <TextWithDeferTooltip>{LONG_TOOLTIP_LABEL}</TextWithDeferTooltip>
          </div>
        </section>
      </PageContentSection>
    </>
  );
}
