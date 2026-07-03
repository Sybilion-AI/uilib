import { Button } from '#uilib/components/ui/Button';
import {
  NotificationsProvider,
  useNotifications,
} from '#uilib/components/ui/Notifications';
import NotificationsGuidance from '#uilib/components/ui/Notifications/AGENT.md';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

function NotificationsDemo() {
  const { show } = useNotifications();

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--p-4)',
        alignItems: 'center',
      }}
    >
      <Button
        type="button"
        onClick={() =>
          show({
            title: 'Changes saved',
            content: 'Your workspace settings were updated.',
          })
        }
      >
        Default toast
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          show({
            type: 'warning',
            title: 'Quota almost reached',
            content: 'Upgrade your plan before the next billing cycle.',
          })
        }
      >
        Warning
      </Button>

      <Button
        type="button"
        variant="destructive"
        onClick={() =>
          show({
            type: 'danger',
            title: 'Export failed',
            content: 'The report could not be generated. Try again.',
          })
        }
      >
        Danger
      </Button>

      <Button
        type="button"
        variant="secondary"
        onClick={() =>
          show({
            type: 'loading',
            title: 'Running forecast',
            content: 'This may take a minute.',
            autoHide: false,
          })
        }
      >
        Loading (persistent)
      </Button>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <NotificationsProvider>
      <AppPageHeader
        breadcrumbs={[{ label: 'Notifications' }]}
        title="Notifications"
        subheader="Transient toast stack with Sybilion styling over the shared notification store."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={NotificationsGuidance} />
      <PageContentSection>
        <NotificationsDemo />
      </PageContentSection>
    </NotificationsProvider>
  );
}
