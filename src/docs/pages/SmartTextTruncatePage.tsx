import { PageContentSection } from '#uilib/components/ui/Page';
import { SmartTextTruncate } from '#uilib/components/ui/SmartTextTruncate';

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
      <DocsGuidance
        overview="SmartTextTruncate shortens a long string in the middle so it fits its container, keeping the end of the string visible. This preserves distinguishing suffixes such as file extensions or trailing identifiers that a plain end ellipsis would hide."
        whenToUse={[
          'For long identifiers, file names, or paths where the ending carries meaning.',
          'In narrow containers, such as table cells or sidebars, where strings of unpredictable length must fit on one line.',
        ]}
        whenNotToUse={[
          'For prose or sentences; standard end truncation reads more naturally.',
          'When the full value must always be visible; let the text wrap instead.',
        ]}
      />
      <PageContentSection>
        <div className={S.resizableDemo}>
          <SmartTextTruncate className={S.demoText}>{LONG}</SmartTextTruncate>
        </div>
      </PageContentSection>
    </>
  );
}
