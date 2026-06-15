import { FileChip } from '#uilib/components/ui/FileChip';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
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
      <DocsGuidance
        overview="FileChip is a compact row that represents a file with a format icon, name, and hint text. It supports an onClick handler for downloadable files and an onRemove handler for detachable attachments, and truncates long file names gracefully."
        whenToUse={[
          'To show attachments in a chat composer or message, with a remove control.',
          'To offer downloadable files, such as CSV presets, where clicking the chip starts the download.',
          'Anywhere a full file card would be too heavy and only the name and format matter.',
        ]}
        whenNotToUse={[
          'As the upload control itself; use DropZone or a file input to collect the file first.',
          'For rich file previews with thumbnails or metadata; use a card layout instead.',
        ]}
        doNotes={[
          'Set the hint to describe the action, such as “Download CSV file”, so the affordance is clear.',
          'Pass the correct format so the chip shows the right icon for the file type.',
        ]}
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
