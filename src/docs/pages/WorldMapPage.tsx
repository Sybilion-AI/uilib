import { PageContentSection } from '#uilib/components/ui/Page';
import { WorldMap } from '#uilib/components/ui/WorldMap';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
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
