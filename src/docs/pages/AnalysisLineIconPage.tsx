import { AnalysisLineIcon } from '#uilib/components/ui/AnalysisLineIcon';
import AnalysisLineIconGuidance from '#uilib/components/ui/AnalysisLineIcon/AGENT.md';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function AnalysisLineIconPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'AnalysisLineIcon' }]}
        title="AnalysisLineIcon"
        subheader="Solid and dashed line markers."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={AnalysisLineIconGuidance} />
      <PageContentSection
        style={{ flexDirection: 'row', gap: '1.5rem', alignItems: 'center' }}
      >
        <AnalysisLineIcon color="var(--chart-1)" variant="solid" />
        <AnalysisLineIcon color="var(--chart-2)" variant="dashed" />
      </PageContentSection>
    </>
  );
}
