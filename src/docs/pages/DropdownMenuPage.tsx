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
