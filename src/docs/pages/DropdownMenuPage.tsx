import { Button } from '#uilib/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#uilib/components/ui/DropdownMenu';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function DropdownMenuPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'DropdownMenu' }]}
        title="DropdownMenu"
        subheader="Context menu with items."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance
        overview="DropdownMenu displays a list of actions or options in a floating panel opened from a trigger, typically a button. Group related items with DropdownMenuLabel and DropdownMenuSeparator, and handle each action in onSelect."
        whenToUse={[
          'To collect secondary actions behind a single trigger, such as an overflow or kebab menu.',
          'When a row, card, or toolbar offers several contextual actions that would crowd the layout as buttons.',
        ]}
        whenNotToUse={[
          'To choose a value for a form field; use Select or Combobox instead.',
          'When there are only one or two actions; show them as buttons directly.',
        ]}
        doNotes={[
          'Order items by expected frequency of use and separate destructive actions from the rest.',
          'Keep item labels short and verb-led, such as “Rename” or “Delete”.',
        ]}
      />
      <PageContentSection>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline">
              Open menu
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => {}}>Item one</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => {}}>Item two</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </PageContentSection>
    </>
  );
}
