import { Badge } from '#uilib/components/ui/Badge';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function BadgePage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Badge' }]}
        title="Badge"
        subheader="Status and label badges."
        actions={<DocsHeaderActions />}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        <Badge>Default</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="red">Red</Badge>
        <Badge variant="green">Green</Badge>
        <Badge squared>Squared</Badge>
      </div>
    </>
  );
}
