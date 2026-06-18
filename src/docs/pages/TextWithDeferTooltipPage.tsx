import { PageContentSection } from '#uilib/components/ui/Page';
import { TextWithDeferTooltip } from '#uilib/components/ui/TextWithDeferTooltip';
import textWithDeferTooltipGuidance from '#uilib/docs/agent-guidance/text-with-defer-tooltip.md';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

const LONG_LABEL =
  'This is a long label that should overflow and show a tooltip on hover.';

export default function TextWithDeferTooltipPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'TextWithDeferTooltip' }]}
        title="TextWithDeferTooltip"
        subheader="Tooltip only when text overflows."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={textWithDeferTooltipGuidance} />
      <PageContentSection>
        <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Default</p>
        <div
          style={{
            maxWidth: 120,
            border: '1px dashed var(--border)',
            padding: 8,
          }}
        >
          <TextWithDeferTooltip>{LONG_LABEL}</TextWithDeferTooltip>
        </div>
      </PageContentSection>
      <PageContentSection>
        <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Over trigger</p>
        <div
          style={{
            maxWidth: 120,
            border: '1px dashed var(--border)',
            padding: 8,
          }}
        >
          <TextWithDeferTooltip overTrigger>{LONG_LABEL}</TextWithDeferTooltip>
        </div>
      </PageContentSection>
    </>
  );
}
