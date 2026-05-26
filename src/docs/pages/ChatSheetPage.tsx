import type { SlashCommandItem } from '#uilib/components/ui/Chat';
import { PageContentSection } from '#uilib/components/ui/Page';
import { MessageSquare } from 'lucide-react';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DOCS_CHAT_USER_KEY } from '../docsConstants';
import { DocsHeaderActions } from '../docsHeaderActions';

const DOCS_CHAT_SHEET_SCOPE_ID = `${DOCS_CHAT_USER_KEY}-docs-chat-sheet-portal`;

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
        subheader="Same integration as design-demo: ChatSheet in page header actions, chat panel portaled into the shell sidebar slot. No inline ChatChrome on this page."
        actions={
          <DocsHeaderActions
            scopeId={DOCS_CHAT_SHEET_SCOPE_ID}
            slashCommandItems={DOCS_SAMPLE_SLASH_ITEMS}
            triggerLabel={
              <>
                <MessageSquare size={20} />
                &nbsp;AI Assistant
              </>
            }
          />
        }
      />
      <PageContentSection>
        <p style={{ marginBottom: 16, fontSize: 14, lineHeight: 1.5 }}>
          Open <strong>AI Assistant</strong> in the header. The composer runs
          inside the portaled chat panel (not inline on this page).
        </p>
        <h3 style={{ marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
          Regression checklist
        </h3>
        <ul
          style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.6 }}
        >
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
