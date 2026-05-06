import { Button } from '#uilib/components/ui/Button';
import { PageContentSection } from '#uilib/components/ui/Page';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#uilib/components/ui/Tooltip';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function TooltipPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Tooltip' }]}
        title="Tooltip"
        subheader="Hover content."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection>
        <span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="outline">
                Hover me
              </Button>
            </TooltipTrigger>
            <TooltipContent>Tooltip text</TooltipContent>
          </Tooltip>
        </span>
      </PageContentSection>
    </>
  );
}
