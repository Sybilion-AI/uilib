import { PageContentSection } from '#uilib/components/ui/Page';
import { SmartTextTruncate } from '#uilib/components/ui/SmartTextTruncate';
import smartTextTruncateGuidance from '#uilib/components/ui/SmartTextTruncate/AGENT.md';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';
import S from './SmartTextTruncatePage.styl';

const LONG =
  'Very-long-identifier-that-might-not-fit-in-a-narrow-container-without-smart-truncation';

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
        <div className={S.resizableDemo}>
          <SmartTextTruncate className={S.demoText}>{LONG}</SmartTextTruncate>
        </div>
      </PageContentSection>
    </>
  );
}
