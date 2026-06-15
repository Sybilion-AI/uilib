import { Button } from '#uilib/components/ui/Button';
import { PageContentSection } from '#uilib/components/ui/Page';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#uilib/components/ui/Sheet';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function SheetPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Sheet' }]}
        title="Sheet"
        subheader="Slide-over panel (Radix dialog)."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance
        overview="Sheet is a slide-over panel built on the Radix dialog primitive. It opens from a screen edge over the current page and is composed from SheetTrigger, SheetContent, SheetHeader, SheetTitle, and SheetDescription."
        whenToUse={[
          'For supplementary tasks that keep the underlying page in context, such as editing details or filters.',
          'On smaller screens where a full dialog would feel cramped and an edge panel works better.',
        ]}
        whenNotToUse={[
          'For short confirmations or alerts; use Dialog or AlertDialog.',
          'For content that deserves its own page or persistent layout region.',
        ]}
        doNotes={[
          'Always include SheetTitle and SheetDescription so the panel is announced correctly to screen readers.',
        ]}
      />
      <PageContentSection>
        <Sheet>
          <SheetTrigger asChild>
            <Button type="button">Open sheet</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Sheet title</SheetTitle>
              <SheetDescription>Sheet description text.</SheetDescription>
            </SheetHeader>
            <p style={{ marginTop: 16 }}>Sheet body.</p>
          </SheetContent>
        </Sheet>
      </PageContentSection>
    </>
  );
}
