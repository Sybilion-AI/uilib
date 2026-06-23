#!/usr/bin/env node
/**
 * Fix misrouted DocsGuidance AGENT.md files after codemod migration.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcRoot = path.join(__dirname, '..', 'src');

/** @param {{ overview: string, whenToUse?: string[], whenNotToUse?: string[], doNotes?: string[], dontNotes?: string[] }} g */
function guidanceToMarkdown(g) {
  const lines = [g.overview, ''];
  if (g.whenToUse?.length) {
    lines.push('## When to use', ...g.whenToUse.map(i => `- ${i}`), '');
  }
  if (g.whenNotToUse?.length) {
    lines.push('## When not to use', ...g.whenNotToUse.map(i => `- ${i}`), '');
  }
  if (g.doNotes?.length) {
    lines.push('## Do', ...g.doNotes.map(i => `- ${i}`), '');
  }
  if (g.dontNotes?.length) {
    lines.push("## Don't", ...g.dontNotes.map(i => `- ${i}`), '');
  }
  return lines.join('\n').trim() + '\n';
}

/** @param {string} rel */
function writeAgent(rel, content) {
  const abs = path.join(srcRoot, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, 'utf8');
  console.log(`Wrote ${rel}`);
}

/** @param {string} pageRel @param {string} importLine @param {string} varName */
function fixPageImport(pageRel, importLine, varName) {
  const abs = path.join(srcRoot, 'docs/pages', pageRel);
  let content = fs.readFileSync(abs, 'utf8');
  content = content.replace(
    /import \w+Guidance from ['"]#uilib\/[^'"]+AGENT\.md['"];?\n/g,
    '',
  );
  content = content.replace(
    /import \w+ from ['"]#uilib\/[^'"]+AGENT\.md['"];?\n/g,
    '',
  );
  content = content.replace(
    /<DocsGuidance source=\{\w+\} \/>/,
    `<DocsGuidance source={${varName}} />`,
  );
  const lastImportIdx = content.lastIndexOf('\nimport ');
  const endOfLine =
    lastImportIdx === -1 ? 0 : content.indexOf('\n', lastImportIdx + 1) + 1;
  content =
    content.slice(0, endOfLine) + importLine + '\n' + content.slice(endOfLine);
  fs.writeFileSync(abs, content, 'utf8');
  console.log(`Fixed ${pageRel}`);
}

const GUIDANCE = {
  button: {
    overview:
      'Buttons trigger an action or event, such as submitting a form or confirming a dialog. Choose a variant that matches the weight of the action: default for the primary action, secondary or outline for supporting actions, ghost for low-emphasis actions, and destructive for irreversible ones.',
    whenToUse: [
      'To trigger an immediate action, such as saving, submitting, or confirming.',
      'To open a dialog, drawer, or other transient surface.',
      'As the primary call to action in a form, card, or empty state.',
    ],
    whenNotToUse: [
      'To navigate to another page; use a link or the link variant instead.',
      'To switch between mutually exclusive options; use Tabs, Toggle, or ToggleGroup.',
    ],
    doNotes: [
      'Use one default-variant button per view so the primary action stays clear.',
      'Label buttons with a verb that describes the action, such as “Save changes”.',
    ],
  },
  label: {
    overview:
      'Label is the styled form label used across the library. Link it to its control with htmlFor so clicking the label focuses the field and assistive technology announces it.',
    whenToUse: [
      'To caption any form control, including Input, Textarea, Select, Switch, and Checkbox.',
      'Whenever a control needs an accessible name that is also visible on screen.',
    ],
    whenNotToUse: [
      'For section headings or general text; use heading elements or SectionHeader.',
      'As inline helper or error text; labels name the field, they do not explain it.',
    ],
    doNotes: [
      'Keep labels short and descriptive, such as “Email address” rather than full sentences.',
    ],
  },
  chip: {
    overview:
      'Chips are compact capsules for filters, status labels, version tags, and quantitative delta indicators. Use the default pill shape for filters and live status; pass squared for compact label badges in lists, tables, and cards.',
    whenToUse: [
      'To present a row of filter options, with the active variant marking the current selection.',
      'To flag live status, version tags, or deadlines with the neutral, accent, and filled variants.',
      'To label or categorise content in lists, tables, and cards with squared and neutral, line, yellow, positive, or negative variants.',
      'To show a quantitative delta or impact direction with the positive or negative variant, optionally with a trend arrow.',
    ],
    whenNotToUse: [
      'For file attachments; use FileChip.',
      'As decoration; the positive and negative variants are reserved for quantitative signals and status meaning.',
    ],
    doNotes: [
      'Keep chip labels short and in sentence case.',
      'Pair the positive and negative variants with a trend arrow or delta value so the direction reads at a glance.',
    ],
  },
  dropdownMenu: {
    overview:
      'DropdownMenu displays a list of actions or options in a floating panel opened from a trigger, typically a button. Group related items with DropdownMenuLabel and DropdownMenuSeparator, and handle each action in onSelect.',
    whenToUse: [
      'To collect secondary actions behind a single trigger, such as an overflow or kebab menu.',
      'When a row, card, or toolbar offers several contextual actions that would crowd the layout as buttons.',
    ],
    whenNotToUse: [
      'To choose a value for a form field; use Select or Combobox instead.',
      'When there are only one or two actions; show them as buttons directly.',
    ],
    doNotes: [
      'Order items by expected frequency of use and separate destructive actions from the rest.',
      'Keep item labels short and verb-led, such as “Rename” or “Delete”.',
    ],
  },
  chart: {
    overview:
      'ChartContainer wraps Recharts charts with the library’s theming, mapping a ChartConfig of labels and colours onto CSS variables. Compose any Recharts chart inside it and reference series colours via var(--color-<key>).',
    whenToUse: [
      'To build bespoke line, bar, or area charts that follow the design system palette.',
      'When you need full control over Recharts composition but consistent theming.',
    ],
    whenNotToUse: [
      'For the standard time series experience with range controls and overlays; use ChartAreaInteractive.',
    ],
    doNotes: [
      'Define every series in the ChartConfig so labels and colours stay consistent across tooltips and legends.',
    ],
  },
  chartAreaInteractivePage: {
    overview:
      'ChartAreaInteractive is the full chart shell for time series data, combining an area chart with a time range selector, a legend with series toggles, and optional forecast overlays. Overlay modes add month pinning, quantile interval bands, or threshold controls on top of the base chart.',
    whenToUse: [
      'To present historical and forecast series together with built-in time range filtering.',
      'When users need to toggle series visibility, pin a month, or inspect quantile intervals and thresholds.',
      'As the main visualisation on an analysis or dataset page.',
    ],
    whenNotToUse: [
      'For a simple static chart without controls; compose ChartContainer with Recharts directly.',
      'For non-temporal data such as categorical comparisons.',
    ],
    doNotes: [
      'Pass loading while data is being fetched so the chart shows its skeleton state.',
    ],
  },
  chat: {
    overview:
      'ChatChrome is the complete chat shell: message list, prompt composer, empty state, and optional preset bubbles. Drive it with useChatPanelChromeModel for a self-contained session, or wire the props manually for full control.',
    whenToUse: [
      'To embed an assistant conversation inline on a page or in a side panel.',
      'When you want preset prompt chips scoped to the current dataset or context.',
    ],
    whenNotToUse: [
      'For a single one-off prompt without conversation history; a simple form may suffice.',
      'For notification or activity feeds; the shell is designed for two-way conversation.',
    ],
    doNotes: [
      'Provide a meaningful emptyState title and description so the first-run view explains what the assistant can do.',
    ],
  },
  card: {
    overview:
      'Card groups related content and actions into a single bounded container with optional header, content, and footer slots. The header supports an icon, title, and description; the footer typically holds actions.',
    whenToUse: [
      'To group a self-contained piece of content, such as a summary, setting, or entity.',
      'In grid dashboards where each tile presents one unit of information.',
      'When content needs a clear visual boundary from its surroundings.',
    ],
    whenNotToUse: [
      'To wrap an entire page; use the page layout primitives instead.',
      'For long, flowing text that does not need a boundary.',
    ],
    doNotes: ['Keep one primary action per card and place it in the footer.'],
  },
  dialog: {
    overview:
      'Dialog presents content in a modal layer above the page, with a trigger, title, optional subtitle, body content, and a footer for actions. It blocks interaction with the page until dismissed.',
    whenToUse: [
      'For focused tasks that must be completed before returning to the page, such as editing details.',
      'To present important information that must not be missed.',
    ],
    whenNotToUse: [
      'For simple yes or no confirmations; use Confirm instead.',
      'For lengthy or complex flows; consider a dedicated page or drawer.',
    ],
    doNotes: [
      'Keep dialog content short and provide a clear primary action in the footer.',
    ],
  },
  confirm: {
    overview:
      'Confirm is a focused confirmation dialog built on Dialog, with a title, body, and paired confirm and cancel actions. Set confirmVariant to destructive for irreversible operations such as deletion.',
    whenToUse: [
      'Before destructive or irreversible actions, such as deleting an item.',
      'When proceeding would discard unsaved work.',
    ],
    whenNotToUse: [
      'For routine, easily reversible actions; frequent confirmations train users to click through.',
      'When the task needs input or several fields; use Dialog instead.',
    ],
    doNotes: [
      'Label the confirm button with the action it performs, such as “Delete”, rather than “OK”.',
    ],
  },
  drawer: {
    overview:
      'Drawer is a panel that slides in from the edge of the screen, built on Vaul for touch-friendly drag-to-dismiss behaviour. Compose it from DrawerTrigger, DrawerContent, DrawerHeader, and DrawerFooter, and give every drawer a DrawerTitle and DrawerDescription.',
    whenToUse: [
      'For supplementary content or actions on mobile, where a bottom sheet feels more natural than a dialog.',
      'For short, focused tasks that the user completes and dismisses, such as confirming a choice or adjusting a setting.',
      'When the user should be able to swipe or drag the surface away to dismiss it.',
    ],
    whenNotToUse: [
      'For critical confirmations that must block interaction; use AlertDialog instead.',
      'For long forms or dense content; use a dedicated page or a Dialog with more room.',
    ],
    doNotes: [
      'Always provide a DrawerTitle and DrawerDescription so screen readers can announce the surface.',
      'Place dismiss actions in DrawerFooter using DrawerClose so they close the drawer consistently.',
    ],
  },
  sheet: {
    overview:
      'Sheet is a slide-over panel built on the Radix dialog primitive. It opens from a screen edge over the current page and is composed from SheetTrigger, SheetContent, SheetHeader, SheetTitle, and SheetDescription.',
    whenToUse: [
      'For supplementary tasks that keep the underlying page in context, such as editing details or filters.',
      'On smaller screens where a full dialog would feel cramped and an edge panel works better.',
    ],
    whenNotToUse: [
      'For short confirmations or alerts; use Dialog or AlertDialog.',
      'For content that deserves its own page or persistent layout region.',
    ],
    doNotes: [
      'Always include SheetTitle and SheetDescription so the panel is announced correctly to screen readers.',
    ],
  },
  tooltip: {
    overview:
      'Tooltip shows brief, supplementary text when users hover or focus a trigger element. Compose Tooltip, TooltipTrigger, and TooltipContent, choosing a side for placement; the overTrigger option positions the content directly over the trigger, which suits revealing truncated text.',
    whenToUse: [
      'To label icon-only buttons or controls whose purpose is not obvious.',
      'To reveal the full value of truncated text on hover.',
      'For short, non-essential hints that supplement the visible interface.',
    ],
    whenNotToUse: [
      'For information users need to complete a task; show it in the layout instead.',
      'For rich or interactive content; use a Popover or HoverCard instead.',
      'On touch-only interfaces where hover is unavailable.',
    ],
    dontNotes: [
      'Don’t repeat text that is already visible next to the trigger.',
    ],
  },
  switch: {
    overview:
      'Switch is a binary control for turning a setting on or off. Unlike a checkbox, a switch implies the change takes effect immediately, without a separate save step.',
    whenToUse: [
      'For settings that apply instantly, such as enabling notifications or a feature flag.',
      'When the two states are clearly opposites, such as on and off.',
    ],
    whenNotToUse: [
      'In forms where changes are committed by a submit action; use Checkbox instead.',
      'For selecting one of several options; use RadioGroup, Toggle, or ToggleGroup.',
    ],
    doNotes: [
      'Pair the switch with a Label linked via htmlFor so the state being controlled is clear.',
    ],
  },
  pageFooter: {
    overview:
      'PageFooter renders the page-level footer with copyright, a version label, and an optional row of links that wrap on narrow viewports. Links accept an icon and label and open external destinations.',
    whenToUse: [
      'At the bottom of an application shell to show copyright, version, and support links.',
      'When you need a consistent set of external links, such as website, email, or community channels.',
    ],
    whenNotToUse: [
      'For page actions or navigation within the app; keep those in the header or sidebar.',
      'Inside individual sections or cards; the footer belongs to the page shell.',
    ],
    doNotes: [
      'Keep the link list short so it remains scannable when it wraps on mobile.',
    ],
  },
  navUserHeader: {
    overview:
      'NavUserHeader shows the signed-in user with their name, email, and avatar, and opens a dropdown menu containing custom rows, a theme toggle, and a logout action. Use the compact variant where horizontal space is limited.',
    whenToUse: [
      'In application chrome, such as a sidebar footer or top bar, to expose account-level actions.',
      'When the user needs quick access to profile, settings, theme, and logout from one place.',
    ],
    whenNotToUse: [
      'For general-purpose menus not tied to the signed-in user; use DropdownMenu directly.',
      'On unauthenticated screens where there is no user to display.',
    ],
    doNotes: [
      'Pass bespoke rows through menuItems rather than recreating the trigger and menu yourself.',
    ],
  },
  signalCard: {
    overview:
      'SignalCard is the product primitive for a single metric: an optional kicker and icon header, a large Manrope figure with unit and tolerance suffixes, body copy, a sparkline slot, and a footer with a delta indicator and muted meta items. Weight carries the emphasis in the numeric block, not colour.',
    whenToUse: [
      'To present a forecast, spot price, or index value with its direction and confidence.',
      'In a dashboard grid where each card answers one quantitative question.',
    ],
    whenNotToUse: [
      'For general grouped content without a headline metric; use Card.',
      'For dense tabular comparisons across many series; use Table.',
    ],
    doNotes: [
      'Keep the footer meta short, such as horizon and confidence.',
      'Pass a Chip with a status variant as the delta so direction reads at a glance.',
    ],
  },
  driversComparisonChartPage: {
    overview:
      'DriversComparisonChart plots a normalized target line against the normalized series of its drivers, with a table of drivers underneath. The Lagged and Overlapped view tabs control whether driver series are shifted by their reported lag or aligned in time, and table rows toggle each series on the chart.',
    whenToUse: [
      'To show how individual drivers move relative to a backtested target over time.',
      'When users need to compare lagged and contemporaneous alignment of driver series.',
      'When the driver table and the chart should stay linked, so hiding a row hides its line.',
    ],
    whenNotToUse: [
      'For a single series with no target to compare against; use ChartAreaInteractive directly.',
      'When drivers lack normalized series data; the chart needs a populated payload to be useful.',
    ],
    doNotes: [
      'Provide a statusHint when the payload is empty so users understand why the chart is blank.',
      'Control viewTab from the page when an external Lagged/Overlapped switcher should stay in sync.',
    ],
  },
  performanceChartPage: {
    overview:
      'PerformanceChart is a widget for evaluating forecast accuracy. It plots per-horizon and spaghetti views of model and drift forecasts against historical data, linked to a metrics table with MAE and MAPE, and handles loading, empty, and run-analysis-hint states.',
    whenToUse: [
      'To present backtest or performance-analysis results for a dataset’s forecasting models.',
      'To compare forecast horizons against actuals, including optional custom series matrices.',
    ],
    whenNotToUse: [
      'For plain historical or forecast charts without performance metrics; use ChartAreaInteractive or LightweightForecastChart.',
      'When no performance analysis exists yet; show a call to action to run one instead.',
    ],
    doNotes: [
      'Wire the loading, empty, and hint props to your data-fetch state so the widget shows the right placeholder.',
    ],
  },
  chatUserCsvAttachment: {
    overview:
      'User messages can carry downloadable text file attachments via userTextFileAttachments: the bubble shows the message text with a separate file row beneath it, matching the dashboard preset pattern. Users can download the attached file from that row.',
    whenToUse: [
      'When a preset or automated flow sends data, such as a CSV extract, on the user’s behalf.',
      'To keep generated file context visible and retrievable in the conversation history.',
    ],
    whenNotToUse: [
      'For user-initiated uploads; use the attachments dropzone instead.',
    ],
    doNotes: [
      'Give each attachment a readable displayName so the file row makes sense out of context.',
    ],
  },
  chatComposerPrefill: {
    overview:
      'The chat composer can be prefilled without auto-sending: pass promptPrefill to ChatChrome, call ChatSheetActions.openNewChatWithPrefill for the portal sheet, or use a ?prompt= deep link. Focus lands at the end of the text so users can edit before submitting.',
    whenToUse: [
      'To seed the composer from a call to action, such as a suggested question on a dataset page.',
      'To deep link into the product with a prepared prompt via ?prompt=.',
      'When opening a new chat session that should start from a template prompt.',
    ],
    whenNotToUse: [
      'To send a message automatically on behalf of the user; prefill never submits.',
    ],
    doNotes: [
      'Keep prefilled text short and editable; it is a starting point, not a command.',
    ],
  },
  standaloneAppLayout: {
    overview:
      'The standalone app layout composes AppShell, Sidebar, and AppShellMainContent into the full chrome for a Sybilion standalone application: collapsible sidebar, sticky app header, scrollable main column, and page footer. This page embeds a live, layout-only preview; for real wiring, copy the standalone app template and follow its README.',
    whenToUse: [
      'When building a new standalone Sybilion app that needs the standard workspace shell.',
      'As a reference for how AppShell, Sidebar, PageScroll, and SybilionAppHeader fit together.',
      'To verify scrolling, sidebar resizing, and header behaviour before wiring real routes.',
    ],
    whenNotToUse: [
      'For individual pages inside an existing app; use PageHeader, PageContent, and PageContentSection instead.',
      'As a nested shell inside another AppShell; an app should have exactly one shell.',
    ],
    doNotes: [
      'Start from the app template rather than assembling the shell by hand, so auth and SDK wiring come for free.',
    ],
  },
  chatSlashCommands: {
    overview:
      'The chat composer supports a slash command palette built on TipTap mentions: typing / at the start of a line or after a space opens a picker, and choosing an item inserts an inline mention chip. Supply items through slashCommandItems; optional className and color style each chip.',
    whenToUse: [
      'To expose a small set of named commands users can invoke from the composer.',
      'When commands should read as part of the message, such as /generate-report.',
    ],
    whenNotToUse: [
      'For long or hierarchical command sets; the palette works best with a handful of items.',
      'For primary actions that deserve a visible button outside the composer.',
    ],
    doNotes: [
      'Keep command ids stable, since plain-text sends fall back to the item id.',
    ],
  },
  chatAttachmentsDropzone: {
    overview:
      'ChatChrome supports a file dropzone: users drag text, Office, or PDF files onto the chat panel and the parsed content attaches to the prompt until they send. Configure accepted types via allowedAttachments and enable PDFs with allowPdfAttachments.',
    whenToUse: [
      'When users need to give the assistant file context, such as CSV data or documents.',
      'When attached files should be reviewed alongside the typed prompt before sending.',
    ],
    whenNotToUse: [
      'For persistent file uploads to storage; use a dedicated upload flow.',
      'When only plain text input is expected; omit the attachment props to disable the dropzone.',
    ],
    doNotes: [
      'Office and PDF parsers load on demand, so the first attachment of those types incurs a one-off load.',
    ],
  },
  chatSheet: {
    overview:
      'ChatSheet places the chat panel behind a trigger in the page header and portals it into the shell chat slot, matching the app dataset page integration. Presets, slash commands, and the empty state are passed through to the underlying chat shell.',
    whenToUse: [
      'When chat is a secondary tool on the page and should open on demand from the header.',
      'To reuse one assistant entry point across pages with page-scoped presets.',
    ],
    whenNotToUse: [
      'When the conversation is the primary content of the page; embed ChatChrome inline instead.',
    ],
    doNotes: [
      'Give each page its own scopeId so chat sessions do not leak between contexts.',
    ],
  },
  lightweightForecastChart: {
    overview:
      'LightweightForecastChart renders historical and forecast time series using TradingView Lightweight Charts, with optional quantile fill bands, a tooltip, and a legend. It applies the shared ensureChartForecastBridge preprocessing so forecast lines connect smoothly to the last historical point.',
    whenToUse: [
      'To plot a historical series alongside one or more forecast lines on a canvas-rendered chart.',
      'To show forecast uncertainty as stacked quantile bands, such as P10–P90 and P25–P75.',
      'When rendering performance matters more than the richer interactions of ChartAreaInteractive.',
    ],
    whenNotToUse: [
      'When you need the full overlay, selection, and interaction features of ChartAreaInteractive.',
      'For categorical or non-time-series data; use a different chart type instead.',
    ],
    doNotes: [
      'Pass raw forecast anchor rows; the chart applies the bridge preprocessing internally.',
      'Set isDarkTheme from the active theme so colours match the surrounding page.',
    ],
  },
};

const CHART_AREA_INTERACTIVE_WIDGET_TAIL = `
## Report tile
- \`dataset_card\` — host loads dataset + analysis; chart inside dashboard card.

## Host provides
- \`chartData\`, \`forecastData\` built from API
- \`timeRange\` / \`onTimeRangeChange\` or brush-only range
- Optional \`mode\`: pin | intervals | thresholds + overlay state

## Requires
- \`chartData\`; \`forecastData\`; \`loading\`; \`toggleLegendSeries\` / \`ensureAnalysisSeriesVisible\` when legend is external.

## Empty/loading
- \`loading\`, \`error\`; empty data shows chart empty state via host message props.
`.trim();

/** @param {string} widgetRel @param {ReturnType<typeof guidanceToMarkdown>} pageMd */
function mergeWidgetAgent(widgetRel, pageGuidance) {
  const abs = path.join(srcRoot, widgetRel);
  const existing = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : '';
  const pageMd = guidanceToMarkdown(pageGuidance).trim();
  if (!existing || existing.includes('## Report tile')) {
    const tailStart = existing.indexOf('## Report tile');
    const tail = tailStart >= 0 ? existing.slice(tailStart).trim() : '';
    writeAgent(widgetRel, tail ? `${pageMd}\n\n${tail}\n` : `${pageMd}\n`);
    return;
  }
  writeAgent(widgetRel, `${pageMd}\n\n${existing.trim()}\n`);
}

// Restore component AGENT.md files
writeAgent(
  'components/ui/Button/AGENT.md',
  guidanceToMarkdown(GUIDANCE.button),
);
writeAgent('components/ui/Label/AGENT.md', guidanceToMarkdown(GUIDANCE.label));
writeAgent('components/ui/Chip/AGENT.md', guidanceToMarkdown(GUIDANCE.chip));
writeAgent(
  'components/ui/DropdownMenu/AGENT.md',
  guidanceToMarkdown(GUIDANCE.dropdownMenu),
);
writeAgent('components/ui/Chart/AGENT.md', guidanceToMarkdown(GUIDANCE.chart));
writeAgent('components/ui/Chat/AGENT.md', guidanceToMarkdown(GUIDANCE.chat));
writeAgent('components/ui/Card/AGENT.md', guidanceToMarkdown(GUIDANCE.card));
writeAgent(
  'components/ui/Dialog/AGENT.md',
  guidanceToMarkdown(GUIDANCE.dialog),
);
writeAgent(
  'components/ui/Confirm/AGENT.md',
  guidanceToMarkdown(GUIDANCE.confirm),
);
writeAgent(
  'components/ui/Drawer/AGENT.md',
  guidanceToMarkdown(GUIDANCE.drawer),
);
writeAgent('components/ui/Sheet/AGENT.md', guidanceToMarkdown(GUIDANCE.sheet));
writeAgent(
  'components/ui/Tooltip/AGENT.md',
  guidanceToMarkdown(GUIDANCE.tooltip),
);
writeAgent(
  'components/ui/Switch/AGENT.md',
  guidanceToMarkdown(GUIDANCE.switch),
);
writeAgent(
  'components/ui/NavUserHeader/AGENT.md',
  guidanceToMarkdown(GUIDANCE.navUserHeader),
);
writeAgent(
  'components/ui/SignalCard/AGENT.md',
  guidanceToMarkdown(GUIDANCE.signalCard),
);

writeAgent(
  'components/ui/ChartAreaInteractive/AGENT.md',
  `${guidanceToMarkdown(GUIDANCE.chartAreaInteractivePage).trim()}\n\n${CHART_AREA_INTERACTIVE_WIDGET_TAIL}\n`,
);

mergeWidgetAgent(
  'components/widgets/DriversComparisonChart/AGENT.md',
  GUIDANCE.driversComparisonChartPage,
);
mergeWidgetAgent(
  'components/widgets/PerformanceChart/AGENT.md',
  GUIDANCE.performanceChartPage,
);

// Agent-guidance pages
writeAgent(
  'docs/agent-guidance/page-footer.md',
  guidanceToMarkdown(GUIDANCE.pageFooter),
);
writeAgent(
  'docs/agent-guidance/standalone-app-layout.md',
  guidanceToMarkdown(GUIDANCE.standaloneAppLayout),
);
writeAgent(
  'docs/agent-guidance/chat-user-csv-attachment.md',
  guidanceToMarkdown(GUIDANCE.chatUserCsvAttachment),
);
writeAgent(
  'docs/agent-guidance/chat-composer-prefill.md',
  guidanceToMarkdown(GUIDANCE.chatComposerPrefill),
);
writeAgent(
  'docs/agent-guidance/chat-slash-commands.md',
  guidanceToMarkdown(GUIDANCE.chatSlashCommands),
);
writeAgent(
  'docs/agent-guidance/chat-attachments-dropzone.md',
  guidanceToMarkdown(GUIDANCE.chatAttachmentsDropzone),
);
writeAgent(
  'docs/agent-guidance/chat-sheet.md',
  guidanceToMarkdown(GUIDANCE.chatSheet),
);
writeAgent(
  'docs/agent-guidance/lightweight-forecast-chart.md',
  guidanceToMarkdown(GUIDANCE.lightweightForecastChart),
);

// Fix page imports
const pageFixes = [
  [
    'DialogPage.tsx',
    "import DialogGuidance from '#uilib/components/ui/Dialog/AGENT.md';",
    'DialogGuidance',
  ],
  [
    'ConfirmPage.tsx',
    "import ConfirmGuidance from '#uilib/components/ui/Confirm/AGENT.md';",
    'ConfirmGuidance',
  ],
  [
    'DrawerPage.tsx',
    "import DrawerGuidance from '#uilib/components/ui/Drawer/AGENT.md';",
    'DrawerGuidance',
  ],
  [
    'DropdownMenuPage.tsx',
    "import DropdownMenuGuidance from '#uilib/components/ui/DropdownMenu/AGENT.md';",
    'DropdownMenuGuidance',
  ],
  [
    'SheetPage.tsx',
    "import SheetGuidance from '#uilib/components/ui/Sheet/AGENT.md';",
    'SheetGuidance',
  ],
  [
    'TooltipPage.tsx',
    "import TooltipGuidance from '#uilib/components/ui/Tooltip/AGENT.md';",
    'TooltipGuidance',
  ],
  [
    'SwitchPage.tsx',
    "import SwitchGuidance from '#uilib/components/ui/Switch/AGENT.md';",
    'SwitchGuidance',
  ],
  [
    'PageFooterPage.tsx',
    "import pageFooterGuidance from '#uilib/docs/agent-guidance/page-footer.md';",
    'pageFooterGuidance',
  ],
  [
    'NavUserHeaderPage.tsx',
    "import NavUserHeaderGuidance from '#uilib/components/ui/NavUserHeader/AGENT.md';",
    'NavUserHeaderGuidance',
  ],
  [
    'SignalCardPage.tsx',
    "import SignalCardGuidance from '#uilib/components/ui/SignalCard/AGENT.md';",
    'SignalCardGuidance',
  ],
  [
    'DriversComparisonChartPage.tsx',
    "import DriversComparisonChartGuidance from '#uilib/components/widgets/DriversComparisonChart/AGENT.md';",
    'DriversComparisonChartGuidance',
  ],
  [
    'PerformanceChartPage.tsx',
    "import PerformanceChartGuidance from '#uilib/components/widgets/PerformanceChart/AGENT.md';",
    'PerformanceChartGuidance',
  ],
  [
    'ChatUserCsvAttachmentPage.tsx',
    "import chatUserCsvAttachmentGuidance from '#uilib/docs/agent-guidance/chat-user-csv-attachment.md';",
    'chatUserCsvAttachmentGuidance',
  ],
  [
    'ChatComposerPrefillPage.tsx',
    "import chatComposerPrefillGuidance from '#uilib/docs/agent-guidance/chat-composer-prefill.md';",
    'chatComposerPrefillGuidance',
  ],
  [
    'StandaloneAppLayoutPage/StandaloneAppLayoutPage.tsx',
    "import standaloneAppLayoutGuidance from '#uilib/docs/agent-guidance/standalone-app-layout.md';",
    'standaloneAppLayoutGuidance',
  ],
  [
    'CardPage.tsx',
    "import CardGuidance from '#uilib/components/ui/Card/AGENT.md';",
    'CardGuidance',
  ],
  [
    'ChatSlashCommandsPage.tsx',
    "import chatSlashCommandsGuidance from '#uilib/docs/agent-guidance/chat-slash-commands.md';",
    'chatSlashCommandsGuidance',
  ],
  [
    'ChatAttachmentsDropzonePage.tsx',
    "import chatAttachmentsDropzoneGuidance from '#uilib/docs/agent-guidance/chat-attachments-dropzone.md';",
    'chatAttachmentsDropzoneGuidance',
  ],
  [
    'ChatSheetPage.tsx',
    "import chatSheetGuidance from '#uilib/docs/agent-guidance/chat-sheet.md';",
    'chatSheetGuidance',
  ],
  [
    'LightweightChartPage.tsx',
    "import lightweightForecastChartGuidance from '#uilib/docs/agent-guidance/lightweight-forecast-chart.md';",
    'lightweightForecastChartGuidance',
  ],
];

for (const [pageRel, importLine, varName] of pageFixes) {
  fixPageImport(pageRel, importLine, varName);
}

console.log('Done fixing docs guidance routing.');
