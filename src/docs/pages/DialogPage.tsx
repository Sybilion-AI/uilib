import { useState } from 'react';

import { Button } from '#uilib/components/ui/Button';
import { Dialog } from '#uilib/components/ui/Dialog';
import DialogGuidance from '#uilib/components/ui/Dialog/AGENT.md';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function DialogPage() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Dialog' }]}
        title="Dialog"
        subheader="Modal dialog with trigger and footer."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={DialogGuidance} />
      <PageContentSection>
        <Dialog
          open={open}
          onOpenChange={setOpen}
          trigger={<Button type="button">Open dialog</Button>}
          title="Dialog title"
          subtitle="Optional subtitle"
          content={<p style={{ margin: 0 }}>Dialog body content.</p>}
          footer={
            <Button type="button" onClick={() => setOpen(false)}>
              Close
            </Button>
          }
        />
      </PageContentSection>
    </>
  );
}
