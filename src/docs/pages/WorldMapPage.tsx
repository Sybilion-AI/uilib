import { PageContentSection } from '#uilib/components/ui/Page';
import { WorldMap } from '#uilib/components/ui/WorldMap';
import worldMapGuidance from '#uilib/docs/agent-guidance/world-map.md';

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
      <DocsGuidance source={worldMapGuidance} />
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
