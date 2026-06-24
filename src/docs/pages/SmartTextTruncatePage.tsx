import { PageContentSection } from '#uilib/components/ui/Page';
import { SmartTextTruncate } from '#uilib/components/ui/SmartTextTruncate';
import smartTextTruncateGuidance from '#uilib/components/ui/SmartTextTruncate/AGENT.md';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';
import S from './SmartTextTruncatePage.styl';

const LONG =
  'Very-long-identifier-that-might-not-fit-in-a-narrow-container-without-smart-truncation';

const LIST_ITEMS = Array.from({ length: 50 }, (_, index) => {
  const suffix = ['Constraints', 'Ontraction', 'Market Risk', 'City Protests'][
    index % 4
  ];
  return `Impact — Impact Report: Professional Beauty Segment Analysis ${index + 1} ${suffix} Index`;
});

export default function SmartTextTruncatePage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'SmartTextTruncate' }]}
        title="SmartTextTruncate"
        subheader="Smart ellipsis for long strings."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={smartTextTruncateGuidance} />
      <PageContentSection>
        <p className={S.sectionLabel}>Single item</p>
        <div className={S.resizableDemo} data-smart-text-truncate-resize-root>
          <SmartTextTruncate className={S.demoText}>{LONG}</SmartTextTruncate>
        </div>

        <p className={S.sectionLabel}>List stress test (50 items)</p>
        <div
          className={S.resizableListDemo}
          data-smart-text-truncate-resize-root
        >
          {LIST_ITEMS.map(label => (
            <SmartTextTruncate key={label} className={S.demoText}>
              {label}
            </SmartTextTruncate>
          ))}
        </div>
      </PageContentSection>
    </>
  );
}
