import { Button } from '#uilib/components/ui/Button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#uilib/components/ui/Sheet';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
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
    </>
  );
}
