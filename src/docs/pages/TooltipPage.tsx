import { Button } from '#uilib/components/ui/Button';
import { PageContentSection } from '#uilib/components/ui/Page';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#uilib/components/ui/Tooltip';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

const TOOLTIP_SIDES = ['left', 'top', 'bottom', 'right'] as const;

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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {TOOLTIP_SIDES.map(side => (
            <Tooltip key={side}>
              <TooltipTrigger asChild>
                <Button type="button" variant="outline">
                  {side.charAt(0).toUpperCase() + side.slice(1)}
                </Button>
              </TooltipTrigger>
              <TooltipContent side={side}>Tooltip opens {side}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </PageContentSection>
    </>
  );
}
