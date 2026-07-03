import { useState } from 'react';

import DropZoneGuidance from '#uilib/components/ui/DropZone/AGENT.md';
import { DropZone } from '#uilib/components/ui/DropZone/DropZone';
import { FileChip, type FileChipFormat } from '#uilib/components/ui/FileChip';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

function formatFromFilename(filename: string): FileChipFormat {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.csv')) return 'csv';
  if (lower.endsWith('.pdf')) return 'pdf';
  if (
    lower.endsWith('.png') ||
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg')
  ) {
    return 'text';
  }
  return 'text';
}

function hintForFilename(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.csv')) return 'CSV file';
  if (lower.endsWith('.txt')) return 'Text file';
  if (lower.endsWith('.png')) return 'PNG image';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'JPEG image';
  return 'Attached file';
}

function DropZoneDemo() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <>
      <DropZone
        multiple
        accept=".csv,.txt,.png,.jpg,.jpeg,image/png,image/jpeg"
        label="Drop .csv, .txt, PNG, or JPEG files here"
        onFiles={newFiles => setFiles(prev => [...prev, ...newFiles])}
      />
      {files.map((file, index) => (
        <FileChip
          key={`${file.name}-${index}`}
          name={file.name}
          format={formatFromFilename(file.name)}
          hint={hintForFilename(file.name)}
          onRemove={() => setFiles(prev => prev.filter((_, i) => i !== index))}
        />
      ))}
    </>
  );
}

export default function DropZonePage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'DropZone' }]}
        title="DropZone"
        subheader="Drag and drop or pick one or more files."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={DropZoneGuidance} />
      <PageContentSection
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '1rem',
        }}
      >
        <DropZoneDemo />
      </PageContentSection>
    </>
  );
}
