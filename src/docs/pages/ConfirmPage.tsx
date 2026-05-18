import { useState } from 'react';

import { Button } from '#uilib/components/ui/Button';
import { Confirm } from '#uilib/components/ui/Confirm';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function ConfirmPage() {
  const [openDefault, setOpenDefault] = useState(false);
  const [openDestructive, setOpenDestructive] = useState(false);

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Confirm' }]}
        title="Confirm"
        subheader="Confirmation dialog built on Dialog with primary and cancel actions."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--p-4)',
            alignItems: 'center',
          }}
        >
          <Confirm
            open={openDefault}
            onOpenChange={setOpenDefault}
            trigger={<Button type="button">Open confirm</Button>}
            title="Discard changes?"
            confirmLabel="Discard"
            cancelLabel="Keep editing"
            onConfirm={() => setOpenDefault(false)}
          >
            You have unsaved changes. They will be lost if you continue.
          </Confirm>

          <Confirm
            open={openDestructive}
            onOpenChange={setOpenDestructive}
            trigger={
              <Button type="button" variant="destructive">
                Delete item
              </Button>
            }
            title="Delete item?"
            confirmLabel="Delete"
            cancelLabel="Cancel"
            confirmVariant="destructive"
            onConfirm={() => setOpenDestructive(false)}
          >
            This action cannot be undone.
          </Confirm>
        </div>
      </PageContentSection>
    </>
  );
}
