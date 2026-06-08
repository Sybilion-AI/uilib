import { ChatChrome, useChatPanelChromeModel } from '#uilib/components/ui/Chat';
import { PageContentSection } from '#uilib/components/ui/Page';

import {
  DOCS_DATASET_PRESETS,
  DOCS_SAMPLE_DATASET_NAME,
} from '../chatPresets.sample';
import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DOCS_CHAT_USER_KEY } from '../docsConstants';
import { DocsHeaderActions } from '../docsHeaderActions';
import S from './ChatPage.styl';

const DOCS_CHAT_INLINE_SCOPE_ID = `${DOCS_CHAT_USER_KEY}-docs-chat-inline`;

export default function ChatPage() {
  const { chromeProps } = useChatPanelChromeModel({
    embedAsPage: true,
    scopeId: DOCS_CHAT_INLINE_SCOPE_ID,
    presets: DOCS_DATASET_PRESETS,
    emptyState: {
      title: 'Start a conversation',
      description:
        'Send a message below or pick a preset chip. The demo echoes your text after a short delay.',
      additionalContent: (
        <p>Optional empty-state slot via additionalContent.</p>
      ),
    },
  });

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Chat' }]}
        title="Chat"
        subheader={`Chat shell with message list, prompt, and dataset-scoped preset bubbles for "${DOCS_SAMPLE_DATASET_NAME}".`}
        actions={<DocsHeaderActions presets={DOCS_DATASET_PRESETS} />}
      />
      <PageContentSection>
        <p style={{ marginBottom: 16, fontSize: 14, lineHeight: 1.5 }}>
          Preset chips render above the prompt in the empty state (fixed layout)
          and inline after the assistant reply. Click a chip to send its text;
          used chips hide for the session.
        </p>
        <div className={S.chatDemoHost}>
          <ChatChrome {...chromeProps} />
        </div>
      </PageContentSection>
    </>
  );
}
