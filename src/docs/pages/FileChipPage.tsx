import { FileChip } from '#uilib/components/ui/FileChip';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

const LONG_NAME =
  'quarterly_procurement_open_orders_analysis_am_i_overpaying_export_final_v2.csv';

export default function FileChipPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'FileChip' }]}
        title="FileChip"
        subheader="Compact file row for chat attachments and downloadable CSV presets."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '1rem',
        }}
      >
        <FileChip name="report.pdf" format="pdf" hint="PDF" />
        <FileChip
          name="notes.txt"
          format="text"
          hint="Text file"
          onRemove={() => {}}
        />
        <FileChip
          name={LONG_NAME}
          format="csv"
          hint="Download CSV file"
          onClick={() => {}}
        />
        <FileChip
          name={LONG_NAME}
          format="csv"
          hint="Download CSV file"
          onClick={() => {}}
          onRemove={() => {}}
        />
      </PageContentSection>
    </>
  );
}
