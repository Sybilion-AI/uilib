import { useState } from 'react';

import { Button } from '#uilib/components/ui/Button';
import { Dialog } from '#uilib/components/ui/Dialog';
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
      <DocsGuidance
        overview="Dialog presents content in a modal layer above the page, with a trigger, title, optional subtitle, body content, and a footer for actions. It blocks interaction with the page until dismissed."
        whenToUse={[
          'For focused tasks that must be completed before returning to the page, such as editing details.',
          'To present important information that must not be missed.',
        ]}
        whenNotToUse={[
          'For simple yes or no confirmations; use Confirm instead.',
          'For lengthy or complex flows; consider a dedicated page or drawer.',
        ]}
        doNotes={[
          'Keep dialog content short and provide a clear primary action in the footer.',
        ]}
      />
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
