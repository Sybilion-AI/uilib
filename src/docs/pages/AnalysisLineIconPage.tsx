import { AnalysisLineIcon } from '#uilib/components/ui/AnalysisLineIcon';
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
      <DocsGuidance
        overview="AnalysisLineIcon renders a small solid or dashed line marker in a given colour. Use it as a legend swatch so users can match a label to its line on a chart."
        whenToUse={[
          'In chart legends, selectors, or tooltips to identify a series by colour and line style.',
          'To distinguish historical series (solid) from forecast series (dashed).',
        ]}
        whenNotToUse={[
          'As a generic decorative icon; it only conveys meaning next to a chart.',
          'To indicate status or severity; use Badge instead.',
        ]}
      />
      <PageContentSection
        style={{ flexDirection: 'row', gap: '1.5rem', alignItems: 'center' }}
      >
        <AnalysisLineIcon color="var(--chart-1)" variant="solid" />
        <AnalysisLineIcon color="var(--chart-2)" variant="dashed" />
      </PageContentSection>
    </>
  );
}
