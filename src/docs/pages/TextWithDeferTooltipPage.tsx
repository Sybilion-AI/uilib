import { PageContentSection } from '#uilib/components/ui/Page';
import { TextWithDeferTooltip } from '#uilib/components/ui/TextWithDeferTooltip';

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
      <DocsGuidance
        overview="TextWithDeferTooltip truncates its text with an ellipsis and shows the full value in a tooltip, but only when the text actually overflows its container. Fully visible text gets no tooltip, avoiding redundant hover content."
        whenToUse={[
          'For labels of unpredictable length in constrained spaces, such as table cells or list rows.',
          'When the full value should remain accessible on hover without widening the layout.',
        ]}
        whenNotToUse={[
          'When the full text is critical and must always be visible; let it wrap instead.',
          'For identifiers where the end of the string matters; consider SmartTextTruncate.',
        ]}
        doNotes={[
          'Use overTrigger to position the tooltip directly over the truncated text, which reads like the text expanding in place.',
        ]}
      />
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
