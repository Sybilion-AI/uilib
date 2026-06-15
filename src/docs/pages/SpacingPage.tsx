import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';
import S from './SpacingPage.styl';

/** Steps defined in globals.css; each step is 4px. */
const STEPS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 16, 17, 18, 19, 20, 23, 24,
];

export default function SpacingPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Spacing' }]}
        title="Spacing"
        subheader="The --p-* scale — a 4px-based rhythm for padding, gaps, and margins."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance
        overview="The --p-* tokens are the canonical spacing scale: each step is a multiple of 4px, from --p-1 (4px) up to --p-24 (96px). Use them for padding, gaps, and margins instead of raw pixel values, so layouts share the same rhythm everywhere."
        whenToUse={[
          'Gaps and padding inside components and page sections.',
          'Vertical rhythm between sections, cards, and form fields.',
        ]}
        whenNotToUse={[
          'One-off pixel values that sit between steps; pick the nearest token instead.',
        ]}
      />
      <PageContentSection>
        <h3>Scale</h3>
        <p className={S.sectionNote}>
          Bar length equals the token value. Steps 13–15 and 21–22 are
          intentionally not defined.
        </p>
        <div className={S.scale}>
          {STEPS.map(step => (
            <div key={step} className={S.row}>
              <span className={S.token}>--p-{step}</span>
              <div className={S.bar} style={{ width: `var(--p-${step})` }} />
              <span className={S.value}>{step * 4}px</span>
            </div>
          ))}
        </div>
      </PageContentSection>
    </>
  );
}
