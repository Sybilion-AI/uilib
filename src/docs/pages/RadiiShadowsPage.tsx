import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';
import S from './RadiiShadowsPage.styl';

const RADIUS_SCALE = [
  { token: '--radius-0', px: '0px' },
  { token: '--radius-1', px: '2px' },
  { token: '--radius-2', px: '4px' },
  { token: '--radius-3', px: '8px' },
  { token: '--radius-4', px: '12px' },
];

const RADIUS_ALIASES = [
  { token: '--radius-sm', px: '4px' },
  { token: '--radius-md', px: '6px' },
  { token: '--radius-lg', px: '8px' },
];

const RADIUS_SEMANTIC = [
  { token: '--radius-button', px: '10px' },
  { token: '--radius-card', px: '12px' },
  { token: '--radius-input', px: '10px' },
];

const SHADOWS = [
  { token: '--shadow-0', value: 'none' },
  { token: '--shadow-1', value: '0 1px 0' },
  { token: '--shadow-2', value: '0 2px 8px' },
  { token: '--shadow-3', value: '0 12px 32px' },
];

function RadiusItem({ token, px }: { token: string; px: string }) {
  return (
    <div className={S.item}>
      <div className={S.radiusBox} style={{ borderRadius: `var(${token})` }} />
      <span className={S.token}>{token}</span>
      <span className={S.value}>{px}</span>
    </div>
  );
}

export default function RadiiShadowsPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Radii and shadows' }]}
        title="Radii and shadows"
        subheader="Square-biased corner radii and three restrained elevation levels."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance
        overview="Corners are small and square-biased: the scale runs from 0 to 12px, with semantic aliases for buttons, cards, and inputs. Elevation is restrained — three slate-tinted shadows that separate surfaces without floating them."
        whenToUse={[
          'Semantic radii (--radius-button/card/input) on the controls they are named after.',
          '--shadow-1 or --shadow-2 for cards and popovers; --shadow-3 only for dialogs and other top-level surfaces.',
        ]}
        whenNotToUse={[
          'Heavy or coloured drop shadows; elevation stays subtle in this system.',
        ]}
      />
      <PageContentSection>
        <h3>Radius scale</h3>
        <div className={S.row}>
          {RADIUS_SCALE.map(item => (
            <RadiusItem key={item.token} {...item} />
          ))}
          <div className={S.item}>
            <div
              className={S.pillBox}
              style={{ borderRadius: 'var(--radius-pill)' }}
            />
            <span className={S.token}>--radius-pill</span>
            <span className={S.value}>999px</span>
          </div>
        </div>
      </PageContentSection>
      <PageContentSection>
        <h3>Aliases and semantic radii</h3>
        <p className={S.sectionNote}>
          Size aliases used across styles, and per-control semantic tokens.
        </p>
        <div className={S.row}>
          {[...RADIUS_ALIASES, ...RADIUS_SEMANTIC].map(item => (
            <RadiusItem key={item.token} {...item} />
          ))}
        </div>
      </PageContentSection>
      <PageContentSection>
        <h3>Shadows</h3>
        <div className={S.row}>
          {SHADOWS.map(({ token, value }) => (
            <div key={token} className={S.item}>
              <div
                className={S.shadowCard}
                style={{ boxShadow: `var(${token})` }}
              >
                <span className={S.token}>{token}</span>
              </div>
              <span className={S.value}>{value}</span>
            </div>
          ))}
        </div>
      </PageContentSection>
    </>
  );
}
