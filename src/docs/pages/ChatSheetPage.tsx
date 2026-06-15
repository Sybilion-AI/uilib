import type { SlashCommandItem } from '#uilib/components/ui/Chat';
import { PageContentSection } from '#uilib/components/ui/Page';
import { MessageSquare } from 'lucide-react';

import {
  DOCS_DATASET_PRESETS,
  DOCS_SAMPLE_DATASET_NAME,
} from '../chatPresets.sample';
import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DOCS_CHAT_USER_KEY } from '../docsConstants';
import { DocsHeaderActions } from '../docsHeaderActions';

const DOCS_CHAT_SHEET_SCOPE_ID = `${DOCS_CHAT_USER_KEY}-docs-dataset-chat`;

const DOCS_SAMPLE_SLASH_ITEMS: SlashCommandItem[] = [
  {
    id: 'sample-command',
    label: 'sample-command',
    description: 'Demo slash item for portal ChatSheet regression.',
  },
];

export default function ChatSheetPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Chat' }, { label: 'Chat sheet' }]}
        title="Chat sheet (portal)"
        subheader={`Same integration as the app dataset page: ChatSheet in header actions with dataset-scoped presets for "${DOCS_SAMPLE_DATASET_NAME}". Panel portaled into the shell chat slot.`}
        actions={
          <DocsHeaderActions
            scopeId={DOCS_CHAT_SHEET_SCOPE_ID}
            slashCommandItems={DOCS_SAMPLE_SLASH_ITEMS}
            presets={DOCS_DATASET_PRESETS}
            triggerLabel={<MessageSquare size={20} />}
            triggerAriaLabel="AI Assistant"
            emptyState={{
              title: 'Start a conversation',
            }}
          />
        }
      />
      <DocsGuidance
        overview="ChatSheet places the chat panel behind a trigger in the page header and portals it into the shell chat slot, matching the app dataset page integration. Presets, slash commands, and the empty state are passed through to the underlying chat shell."
        whenToUse={[
          'When chat is a secondary tool on the page and should open on demand from the header.',
          'To reuse one assistant entry point across pages with page-scoped presets.',
        ]}
        whenNotToUse={[
          'When the conversation is the primary content of the page; embed ChatChrome inline instead.',
        ]}
        doNotes={[
          'Give each page its own scopeId so chat sessions do not leak between contexts.',
        ]}
      />
      <PageContentSection>
        <p style={{ marginBottom: 16, fontSize: 14, lineHeight: 1.5 }}>
          Open <strong>AI Assistant</strong> in the header. Presets render below
          the empty state (fixed layout) and inline after the assistant reply,
          same as{' '}
          <code style={{ fontSize: 13 }}>
            presets=&#123;datasetPresets&#125;
          </code>{' '}
          on the app dataset page.
        </p>
        <h3 style={{ marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
          Regression checklist
        </h3>
        <ul
          style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.6 }}
        >
          <li>
            Empty chat → three outline preset chips with dataset-scoped labels
          </li>
          <li>Preset click → sends preset text, chip hides for that session</li>
          <li>Plain Enter with text → submit and clear composer</li>
          <li>
            Plain Enter must not create empty lines with duplicated placeholders
          </li>
          <li>Shift+Enter with text → multiline, no placeholder after text</li>
          <li>Empty Enter → no submit</li>
          <li>Submit button and slash menu still work</li>
        </ul>
      </PageContentSection>
    </>
  );
}
