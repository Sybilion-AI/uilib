import { Foldable } from '#uilib/components/ui/Foldable';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function FoldablePage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Foldable' }]}
        title="Foldable"
        subheader="Expandable section with header."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance
        overview="Foldable is a collapsible section with a clickable header that shows or hides its content. Pass the header and content as props, and use defaultUnfolded to open the section initially."
        whenToUse={[
          'To tuck away secondary or advanced detail that most users do not need immediately.',
          'To shorten long pages by letting users expand only the sections they care about.',
        ]}
        whenNotToUse={[
          'For content users must always see, such as warnings or required form fields.',
          'For switching between parallel views of the same content; use Tabs instead.',
        ]}
        doNotes={[
          'Write headers that describe the hidden content, so users can decide whether to expand.',
          'Set defaultUnfolded when the content is important enough to show on first view.',
        ]}
      />
      <PageContentSection>
        <Foldable
          header={<span>Click to expand</span>}
          content={<p style={{ margin: 0 }}>Hidden content inside.</p>}
          defaultUnfolded
        />
      </PageContentSection>
    </>
  );
}
