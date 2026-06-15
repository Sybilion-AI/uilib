import { PageContentSection } from '#uilib/components/ui/Page';
import { WorldMap } from '#uilib/components/ui/WorldMap';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';
import S from './WorldMapPage.styl';

export default function WorldMapPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'World map' }]}
        title="WorldMap"
        subheader="Bundled SVG world map for layouts such as DriverMap — optional className for positioning."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance
        overview="WorldMap renders a bundled SVG map of the world, intended as a backdrop for geographic visualisations such as DriverMap. It scales to its container and accepts a className for positioning."
        whenToUse={[
          'As the base layer for geographic overlays, such as markers or regional highlights.',
          'For decorative or contextual world imagery that should ship with the bundle rather than load from a network.',
        ]}
        whenNotToUse={[
          'When interactive map features such as zooming, panning, or tiles are needed; use a mapping library instead.',
          'For precise geographic data where projection accuracy matters.',
        ]}
      />
      <PageContentSection>
        <div className={S.demoFrame}>
          <div className={S.demoFill}>
            <WorldMap />
          </div>
        </div>
      </PageContentSection>
    </>
  );
}
