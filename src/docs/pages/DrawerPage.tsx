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
