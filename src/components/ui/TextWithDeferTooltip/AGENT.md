TextWithDeferTooltip truncates its text with an ellipsis and shows the full value in a tooltip, but only when the text actually overflows its container. Fully visible text gets no tooltip, avoiding redundant hover content.

## When to use

- For labels of unpredictable length in constrained spaces, such as table cells or list rows.
- When the full value should remain accessible on hover without widening the layout.

## When not to use

- When the full text is critical and must always be visible; let it wrap instead.
- For identifiers where the end of the string matters; consider SmartTextTruncate.

## Do

- Use overTrigger to position the tooltip directly over the truncated text, which reads like the text expanding in place.
