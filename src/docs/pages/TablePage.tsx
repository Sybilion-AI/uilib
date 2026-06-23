import { PageContentSection, PageXScroll } from '#uilib/components/ui/Page';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#uilib/components/ui/Table';
import type { TableSize } from '#uilib/components/ui/Table';
import tableGuidance from '#uilib/components/ui/Table/AGENT.md';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

const SIZES = ['sm', 'md', 'lg'] as const satisfies readonly TableSize[];

const SAMPLE_ROWS = [
  { name: 'Ada', role: 'Admin', status: 'Active' },
  { name: 'Bob', role: 'Viewer', status: 'Active' },
  { name: 'Cara', role: 'Editor', status: 'Invited' },
] as const;

function DemoTable({
  size,
  withBackground = false,
  withPaddings = false,
}: {
  size: TableSize;
  withBackground?: boolean;
  withPaddings?: boolean;
}) {
  return (
    <Table
      size={size}
      withBackground={withBackground}
      withPaddings={withPaddings}
    >
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
  );
}

export default function TablePage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Table' }]}
        title="Table"
        subheader="Semantic table primitives and size ramp."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={tableGuidance} />
      <PageXScroll>
        <section
          style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
        >
          <h3 style={{ marginBottom: '1rem' }}>Sizes</h3>
          <p
            style={{
              marginBottom: '0.75rem',
              color: 'var(--muted-foreground)',
            }}
          >
            Pass <code>size</code> on <code>Table</code> — defaults to{' '}
            <code>md</code>.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }} />
                  {SIZES.map(s => (
                    <th key={s} style={{ padding: '0.5rem' }}>
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    style={{
                      padding: '0.5rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      verticalAlign: 'top',
                    }}
                  >
                    default
                  </td>
                  {SIZES.map(s => (
                    <td
                      key={s}
                      style={{ padding: '0.5rem', verticalAlign: 'top' }}
                    >
                      <DemoTable size={s} />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td
                    style={{
                      padding: '0.5rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      verticalAlign: 'top',
                    }}
                  >
                    withBackground
                  </td>
                  {SIZES.map(s => (
                    <td
                      key={s}
                      style={{ padding: '0.5rem', verticalAlign: 'top' }}
                    >
                      <DemoTable size={s} withBackground withPaddings />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </PageXScroll>
    </>
  );
}
