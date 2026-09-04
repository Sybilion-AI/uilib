import supplyChainMapGuidance from '#uilib/components/ui/SupplyChainMap/AGENT.md';
import { SupplyChainMapExample } from '#uilib/components/ui/SupplyChainMap/SupplyChainMap.example';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function SupplyChainMapPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Supply chain map' }]}
        title="SupplyChainMap"
        subheader="Interactive Natural Earth map for confirmed sites and routes — clustering, zoom, labels, and flyTo."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={supplyChainMapGuidance} />
      <SupplyChainMapExample />
    </>
  );
}
