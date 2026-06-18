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
import SheetGuidance from '#uilib/components/ui/Sheet/AGENT.md';

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
      <DocsGuidance source={SheetGuidance} />
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
