import { useState } from 'react';

import { Button } from '#uilib/components/ui/Button';
import { Confirm } from '#uilib/components/ui/Confirm';
import { Dialog } from '#uilib/components/ui/Dialog';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#uilib/components/ui/DropdownMenu';
import { InfoIconTooltip } from '#uilib/components/ui/InfoIconTooltip/InfoIconTooltip';
import { PageContentSection } from '#uilib/components/ui/Page';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#uilib/components/ui/Sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#uilib/components/ui/Tooltip';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

const panelStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
  alignItems: 'center',
  padding: 'var(--p-3)',
  borderRadius: 'var(--radius-3)',
};

export default function OverlaysOverviewPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Overview' }]}
        title="Overview"
        subheader="Modals, panels, menus, and contextual hints."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection
        style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}
      >
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Dialog</h3>
          <div style={panelStyle}>
            <Dialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              trigger={<Button type="button">Open dialog</Button>}
              title="Dialog title"
              subtitle="Optional subtitle"
              content={<p style={{ margin: 0 }}>Dialog body content.</p>}
              footer={
                <Button type="button" onClick={() => setDialogOpen(false)}>
                  Close
                </Button>
              }
            />
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>Confirm</h3>
          <div style={panelStyle}>
            <Confirm
              open={confirmOpen}
              onOpenChange={setConfirmOpen}
              trigger={<Button type="button">Open confirm</Button>}
              title="Discard changes?"
              confirmLabel="Discard"
              cancelLabel="Keep editing"
              onConfirm={() => setConfirmOpen(false)}
            >
              You have unsaved changes. They will be lost if you continue.
            </Confirm>
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>Drawer</h3>
          <div style={panelStyle}>
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
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>Sheet</h3>
          <div style={panelStyle}>
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
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>DropdownMenu</h3>
          <div style={panelStyle}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline">
                  Open menu
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => {}}>
                  Item one
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => {}}>
                  Item two
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>Tooltip</h3>
          <div style={panelStyle}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" variant="outline">
                  Hover me
                </Button>
              </TooltipTrigger>
              <TooltipContent>Tooltip content</TooltipContent>
            </Tooltip>
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>InfoIconTooltip</h3>
          <div style={panelStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14 }}>Forecast horizon</span>
              <InfoIconTooltip>
                Number of months included in the forecast window.
              </InfoIconTooltip>
            </div>
          </div>
        </section>
      </PageContentSection>
    </>
  );
}
