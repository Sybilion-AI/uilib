import { Button } from '#uilib/components/ui/Button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '#uilib/components/ui/Drawer';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function DrawerPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Drawer' }]}
        title="Drawer"
        subheader="Mobile-friendly drawer (Vaul)."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance
        overview="Drawer is a panel that slides in from the edge of the screen, built on Vaul for touch-friendly drag-to-dismiss behaviour. Compose it from DrawerTrigger, DrawerContent, DrawerHeader, and DrawerFooter, and give every drawer a DrawerTitle and DrawerDescription."
        whenToUse={[
          'For supplementary content or actions on mobile, where a bottom sheet feels more natural than a dialog.',
          'For short, focused tasks that the user completes and dismisses, such as confirming a choice or adjusting a setting.',
          'When the user should be able to swipe or drag the surface away to dismiss it.',
        ]}
        whenNotToUse={[
          'For critical confirmations that must block interaction; use AlertDialog instead.',
          'For long forms or dense content; use a dedicated page or a Dialog with more room.',
        ]}
        doNotes={[
          'Always provide a DrawerTitle and DrawerDescription so screen readers can announce the surface.',
          'Place dismiss actions in DrawerFooter using DrawerClose so they close the drawer consistently.',
        ]}
      />
      <PageContentSection>
        <Drawer>
          <DrawerTrigger asChild>
            <Button type="button">Open drawer</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Drawer title</DrawerTitle>
              <DrawerDescription>Short description.</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button type="button" variant="outline">
                  Close
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </PageContentSection>
    </>
  );
}
