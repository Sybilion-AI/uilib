import type { ReactNode } from 'react';

import { PageContentSection } from '#uilib/components/ui/Page';
import typographyGuidance from '#uilib/docs/agent-guidance/typography.md';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';
import S from './TypographyPage.styl';

const TEXT_SCALE = [
  { token: '--text-2xs', px: '10px' },
  { token: '--text-xs', px: '12px' },
  { token: '--text-sm', px: '14px' },
  { token: '--text-base', px: '16px' },
  { token: '--text-lg', px: '18px' },
  { token: '--text-xl', px: '20px' },
  { token: '--text-2xl', px: '24px' },
  { token: '--text-3xl', px: '30px' },
  { token: '--text-4xl', px: '36px' },
  { token: '--text-5xl', px: '48px' },
];

const DISPLAY_SCALE = [
  { token: '--text-display-s', px: '48px' },
  { token: '--text-display-m', px: '64px' },
  { token: '--text-display-l', px: '88px' },
  { token: '--text-display-xl', px: '124px' },
];

const BODY_WEIGHTS = [400, 500, 600, 700, 800];
const HEADING_WEIGHTS = [300, 400, 500];

const LINE_HEIGHTS = [
  { token: '--lh-tight', value: '1.02' },
  { token: '--lh-snug', value: '1.15' },
  { token: '--lh-normal', value: '1.45' },
  { token: '--lh-loose', value: '1.6' },
];

const TRACKINGS = [
  { token: '--tracking-display', value: '-0.02em' },
  { token: '--tracking-heading', value: '-0.01em' },
  { token: '--tracking-body', value: '0em' },
  { token: '--tracking-label', value: '0.04em' },
];

const SAMPLE = 'The decision layer';
const PARAGRAPH =
  'Body copy in Manrope is the operational voice of the system: calm, precise, and industry-fluent. It holds at small sizes and stays legible across dense tables and long reports.';

function SpecimenTable({
  rows,
  valueHeading,
}: {
  rows: { token: string; value: string; specimen: ReactNode }[];
  valueHeading: string;
}) {
  return (
    <table className={S.table}>
      <thead>
        <tr>
          <th>Token</th>
          <th>{valueHeading}</th>
          <th>Specimen</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ token, value, specimen }) => (
          <tr key={token}>
            <td className={S.token}>{token}</td>
            <td className={S.value}>{value}</td>
            <td>{specimen}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function TypographyPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Typography' }]}
        title="Typography"
        subheader="Type scale, weights, line heights, and tracking tokens."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={typographyGuidance} />
      <PageContentSection>
        <h3>Type scale</h3>
        <SpecimenTable
          valueHeading="Size"
          rows={TEXT_SCALE.map(({ token, px }) => ({
            token,
            value: px,
            specimen: (
              <div
                className={S.specimen}
                style={{ fontSize: `var(${token})`, lineHeight: 1.2 }}
              >
                {SAMPLE}
              </div>
            ),
          }))}
        />
      </PageContentSection>
      <PageContentSection>
        <h3>Display scale</h3>
        <p className={S.sectionNote}>
          KMR Apparat at the --text-display-* sizes, tracking
          var(--tracking-display).
        </p>
        <SpecimenTable
          valueHeading="Size"
          rows={DISPLAY_SCALE.map(({ token, px }) => ({
            token,
            value: px,
            specimen: (
              <div
                className={S.specimen}
                style={{
                  fontSize: `var(${token})`,
                  fontFamily: 'var(--font-family-heading)',
                  letterSpacing: 'var(--tracking-display)',
                  lineHeight: 'var(--lh-tight)',
                }}
              >
                {SAMPLE}
              </div>
            ),
          }))}
        />
      </PageContentSection>
      <PageContentSection>
        <h3>Weights</h3>
        <p className={S.sectionNote}>Manrope — body font.</p>
        <SpecimenTable
          valueHeading="Weight"
          rows={BODY_WEIGHTS.map(weight => ({
            token: `Manrope ${weight}`,
            value: String(weight),
            specimen: (
              <div
                className={S.specimen}
                style={{ fontWeight: weight, fontSize: 'var(--text-lg)' }}
              >
                {SAMPLE}
              </div>
            ),
          }))}
        />
        <p className={S.sectionNote} style={{ marginTop: 'var(--p-6)' }}>
          KMR Apparat — heading font.
        </p>
        <SpecimenTable
          valueHeading="Weight"
          rows={HEADING_WEIGHTS.map(weight => ({
            token: `KMR Apparat ${weight}`,
            value: String(weight),
            specimen: (
              <div
                className={S.specimen}
                style={{
                  fontWeight: weight,
                  fontSize: 'var(--text-2xl)',
                  fontFamily: 'var(--font-family-heading)',
                }}
              >
                {SAMPLE}
              </div>
            ),
          }))}
        />
      </PageContentSection>
      <PageContentSection>
        <h3>Line heights</h3>
        <SpecimenTable
          valueHeading="Value"
          rows={LINE_HEIGHTS.map(({ token, value }) => ({
            token,
            value,
            specimen: (
              <p
                className={S.paragraphSpecimen}
                style={{ lineHeight: `var(${token})` }}
              >
                {PARAGRAPH}
              </p>
            ),
          }))}
        />
      </PageContentSection>
      <PageContentSection>
        <h3>Tracking</h3>
        <SpecimenTable
          valueHeading="Value"
          rows={TRACKINGS.map(({ token, value }) => ({
            token,
            value,
            specimen: (
              <div
                className={S.specimen}
                style={{
                  letterSpacing: `var(${token})`,
                  fontSize: 'var(--text-lg)',
                }}
              >
                {SAMPLE}
              </div>
            ),
          }))}
        />
      </PageContentSection>
    </>
  );
}
