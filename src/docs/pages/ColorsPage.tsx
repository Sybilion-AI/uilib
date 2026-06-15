import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';
import S from './ColorsPage.styl';

const RAMP_STEPS = [
  '50',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
];

const RAMPS: { family: string; tokens: string[] }[] = [
  'cyan',
  'purple',
  'red',
  'green',
  'yellow',
  'gray',
].map(family => ({
  family,
  tokens: RAMP_STEPS.map(step => `--sb-${family}-${step}`),
}));

RAMPS.push({
  family: 'slate',
  tokens: [...RAMP_STEPS, '950'].map(step => `--sb-slate-${step}`),
});

const SEMANTIC_TOKENS = [
  '--background',
  '--foreground',
  '--primary',
  '--muted',
  '--border',
  '--brand-color',
  '--status-positive',
  '--status-positive-bg',
  '--status-negative',
  '--status-negative-bg',
];

function Swatch({ token }: { token: string }) {
  return (
    <div className={S.swatch}>
      <div className={S.chip} style={{ background: `var(${token})` }} />
      <span className={S.token}>{token}</span>
    </div>
  );
}

export default function ColorsPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Colors' }]}
        title="Colors"
        subheader="Core --sb-* ramps and the semantic tokens built on top of them."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance
        overview="Colour is defined as a set of core ramps (--sb-cyan/purple/red/green/yellow/gray/slate) plus semantic tokens that map those ramps onto roles such as background, border, brand, and status. Components should reference semantic tokens first and reach for a raw ramp step only when no role fits."
        whenToUse={[
          'Semantic tokens for surfaces, text, borders, and status colour in components.',
          'Ramp steps for data visualisation or decorative accents where a specific hue is needed.',
        ]}
        whenNotToUse={[
          'Hardcoded hex or oklch values in component styles; always go through a token.',
        ]}
      />
      <PageContentSection>
        <h3>Core ramps</h3>
        {RAMPS.map(({ family, tokens }) => (
          <div key={family} className={S.family}>
            <h4 className={S.familyName}>{family}</h4>
            <div className={S.ramp}>
              {tokens.map(token => (
                <Swatch key={token} token={token} />
              ))}
            </div>
          </div>
        ))}
      </PageContentSection>
      <PageContentSection>
        <h3>Semantic tokens</h3>
        <div className={S.ramp}>
          {SEMANTIC_TOKENS.map(token => (
            <Swatch key={token} token={token} />
          ))}
        </div>
      </PageContentSection>
    </>
  );
}
