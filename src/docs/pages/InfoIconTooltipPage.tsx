import InfoIconTooltipGuidance from '#uilib/components/ui/InfoIconTooltip/AGENT.md';
import { InfoIconTooltip } from '#uilib/components/ui/InfoIconTooltip/InfoIconTooltip';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function InfoIconTooltipPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'InfoIconTooltip' }]}
        title="InfoIconTooltip"
        subheader="Question icon with supplementary tooltip."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={InfoIconTooltipGuidance} />
      <PageContentSection>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <InfoIconTooltip>Test tooltip content.</InfoIconTooltip>
        </div>
      </PageContentSection>
    </>
  );
}
