import { PageContentSection } from '#uilib/components/ui/Page';
import { TextWithDeferTooltip } from '#uilib/components/ui/TextWithDeferTooltip';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function TextWithDeferTooltipPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'TextWithDeferTooltip' }]}
        title="TextWithDeferTooltip"
        subheader="Tooltip only when text overflows."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection
        style={{
          maxWidth: 120,
          border: '1px dashed var(--border)',
          padding: 8,
        }}
      >
        <TextWithDeferTooltip>
          This is a long label that should overflow and show a tooltip on hover.
        </TextWithDeferTooltip>
      </PageContentSection>
    </>
  );
}
