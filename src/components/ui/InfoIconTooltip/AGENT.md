---
summary: Question-icon trigger with a capped-width tooltip for inline supplementary help.
---

InfoIconTooltip renders a small question icon that opens a Tooltip on hover or focus. Pass `children` as the tooltip body; content is capped at 300px width. Use this for the standard “info next to a label” pattern instead of composing Tooltip, TooltipTrigger, and TooltipContent yourself.

## When to use

- To add brief help next to a label, setting name, or metric without expanding the layout.
- When users expect a familiar info-icon affordance for optional, non-critical context.
- For short explanatory copy that supplements visible UI text.

## When not to use

- When you need a custom trigger (button, link, truncated text); compose Tooltip directly.
- For information users must read to complete a task; show it in the layout instead.
- For rich or interactive content; use Popover or HoverCard instead.

## Do

- Keep tooltip text concise; one or two sentences is usually enough.
- Place the icon immediately after the label or control it explains.

## Don't

- Repeat text that is already visible next to the icon.
- Use multiple info icons in a row when a single tooltip or inline description would suffice.
