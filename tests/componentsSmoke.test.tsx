import type { ReactElement } from 'react';

import { Avatar, AvatarFallback } from '#uilib/components/ui/Avatar';
import { Banner } from '#uilib/components/ui/Banner';
import { Button } from '#uilib/components/ui/Button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '#uilib/components/ui/Card';
import { Checkbox } from '#uilib/components/ui/Checkbox';
import { Chip } from '#uilib/components/ui/Chip';
import { Gap } from '#uilib/components/ui/Gap/Gap';
import { Input } from '#uilib/components/ui/Input';
import { Kicker } from '#uilib/components/ui/Kicker';
import { Label } from '#uilib/components/ui/Label';
import { Progress } from '#uilib/components/ui/Progress';
import { PullQuote } from '#uilib/components/ui/PullQuote';
import { Separator } from '#uilib/components/ui/Separator';
import { SignalCard } from '#uilib/components/ui/SignalCard';
import { Skeleton } from '#uilib/components/ui/Skeleton';
import { Sparkline } from '#uilib/components/ui/Sparkline';
import { Switch } from '#uilib/components/ui/Switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#uilib/components/ui/Table';
import { TextShimmer } from '#uilib/components/ui/TextShimmer';
import { Toggle } from '#uilib/components/ui/Toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '#uilib/components/ui/Tooltip';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';

/**
 * Render smoke test for exported leaf components.
 *
 * Intentionally skipped (require providers, portals, or runtime APIs that are
 * impractical in this table-driven setup): Select (Radix portal + item
 * composition), Sidebar (SidebarProvider), Form (FormProvider + useForm),
 * Dialog/Sheet/Drawer/DropdownMenu/
 * Confirm (open-state portals), Chat* (ChatContext + tiptap), ChartArea-
 * Interactive and widget charts (domain data fixtures), WorldMap (canvas/geo),
 * VimeoEmbed (network iframe), NavUserHeader and app-shell widgets (auth/app
 * context).
 */
const CASES: [string, ReactElement][] = [
  ['Button', <Button key="b">Save</Button>],
  ['Banner', <Banner key="bn">Notice</Banner>],
  ['Chip', <Chip key="c">Stable</Chip>],
  [
    'Chip (squared)',
    <Chip key="cs" squared>
      Label
    </Chip>,
  ],
  ['Kicker', <Kicker key="k">Signal</Kicker>],
  [
    'PullQuote',
    <PullQuote key="p" attribution="Jane">
      Quote
    </PullQuote>,
  ],
  ['SignalCard', <SignalCard key="s" title="Metric" value="42" unit="/t" />],
  ['Input', <Input key="i" placeholder="Type here" />],
  ['Label', <Label key="l">Field</Label>],
  ['Separator', <Separator key="s" />],
  ['Skeleton', <Skeleton key="s" />],
  ['Gap', <Gap key="g" />],
  [
    'Card',
    <Card key="c">
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>Body</CardContent>
    </Card>,
  ],
  ['Switch', <Switch key="s" />],
  ['Checkbox', <Checkbox key="c" />],
  ['Progress', <Progress key="p" value={40} />],
  ['Toggle', <Toggle key="t">Bold</Toggle>],
  [
    'Avatar',
    <Avatar key="a">
      <AvatarFallback>AB</AvatarFallback>
    </Avatar>,
  ],
  ['TextShimmer', <TextShimmer key="t">Loading…</TextShimmer>],
  ['Sparkline', <Sparkline key="s" data={[1, 3, 2, 5, 4]} />],
  [
    'Table',
    <Table key="t" size="md">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Iron ore</TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  ],
  [
    'Table (sm)',
    <Table key="t-sm" size="sm">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Iron ore</TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  ],
  [
    'Table (lg)',
    <Table key="t-lg" size="lg">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Iron ore</TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  ],
  [
    'Tooltip',
    <TooltipProvider key="t">
      <Tooltip>
        <TooltipTrigger>Hover</TooltipTrigger>
        <TooltipContent>Hint</TooltipContent>
      </Tooltip>
    </TooltipProvider>,
  ],
];

describe('component render smoke test', () => {
  it.each(CASES)('renders %s without crashing', (_name, element) => {
    const { container } = render(element);
    expect(container).toBeInTheDocument();
  });
});
