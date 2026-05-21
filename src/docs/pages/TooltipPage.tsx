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

const OVER_TRIGGER_TEXT =
  'Actual Order volume for Baerlocher MB 301, a compound that includes stearin as a component. MB 301 is typically used in construction-grade applications.';

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
      <PageContentSection>
        <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Over trigger</p>
        <div
          style={{
            maxWidth: 280,
            border: '1px dashed var(--border)',
            padding: 8,
          }}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontWeight: 600,
                }}
              >
                {OVER_TRIGGER_TEXT}
              </div>
            </TooltipTrigger>
            <TooltipContent overTrigger maxWidth={400}>
              {OVER_TRIGGER_TEXT}
            </TooltipContent>
          </Tooltip>
        </div>
      </PageContentSection>
    </>
  );
}
