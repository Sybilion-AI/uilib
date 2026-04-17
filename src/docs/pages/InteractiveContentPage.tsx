import { InteractiveContent } from '#uilib/components/ui/InteractiveContent';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

const SAMPLE = 'Use **bold** and *italic* in formatted text.';

export default function InteractiveContentPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'InteractiveContent' }]}
        title="InteractiveContent"
        subheader="Inline formatting from assistant-style text."
        actions={<DocsHeaderActions />}
      />
      <p>
        <InteractiveContent text={SAMPLE} />
      </p>
    </>
  );
}
