import { useState } from 'react';

import { Button } from '#uilib/components/ui/Button';
import { Confirm } from '#uilib/components/ui/Confirm';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
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
      <DocsGuidance
        overview="Confirm is a focused confirmation dialog built on Dialog, with a title, body, and paired confirm and cancel actions. Set confirmVariant to destructive for irreversible operations such as deletion."
        whenToUse={[
          'Before destructive or irreversible actions, such as deleting an item.',
          'When proceeding would discard unsaved work.',
        ]}
        whenNotToUse={[
          'For routine, easily reversible actions; frequent confirmations train users to click through.',
          'When the task needs input or several fields; use Dialog instead.',
        ]}
        doNotes={[
          'Label the confirm button with the action it performs, such as “Delete”, rather than “OK”.',
        ]}
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
