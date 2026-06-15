import { Button } from '#uilib/components/ui/Button';
import { PageContentSection } from '#uilib/components/ui/Page';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#uilib/components/ui/Tooltip';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

const TOOLTIP_SIDES = ['left', 'top', 'bottom', 'right'] as const;

const LONG_TEXT =
  'This is a long text that should overflow and show a tooltip on hover.';

export default function TooltipPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Tooltip' }]}
        title="Tooltip"
        subheader="Hover content."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance
        overview="Tooltip shows brief, supplementary text when users hover or focus a trigger element. Compose Tooltip, TooltipTrigger, and TooltipContent, choosing a side for placement; the overTrigger option positions the content directly over the trigger, which suits revealing truncated text."
        whenToUse={[
          'To label icon-only buttons or controls whose purpose is not obvious.',
          'To reveal the full value of truncated text on hover.',
          'For short, non-essential hints that supplement the visible interface.',
        ]}
        whenNotToUse={[
          'For information users need to complete a task; show it in the layout instead.',
          'For rich or interactive content; use a Popover or HoverCard instead.',
          'On touch-only interfaces where hover is unavailable.',
        ]}
        dontNotes={[
          'Don’t repeat text that is already visible next to the trigger.',
        ]}
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

        <div
          style={{
            display: 'inline-block',
            padding: 'var(--p-4)',
            marginTop: 'var(--p-4)',
          }}
        >
          <h3>Tooltip over trigger:</h3>
          <br />
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                style={{
                  maxWidth: '200px',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                {LONG_TEXT}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" overTrigger>
              {LONG_TEXT}
            </TooltipContent>
          </Tooltip>
        </div>
      </PageContentSection>
    </>
  );
}
