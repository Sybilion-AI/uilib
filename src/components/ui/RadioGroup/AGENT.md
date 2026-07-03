RadioGroup is a single-choice control for selecting one option from a short list. Pair each RadioGroupItem with a Label linked via htmlFor so the text is clickable and announced by assistive technology.

Runnable examples: [RadioGroup.example.tsx](./RadioGroup.example.tsx).

## When to use

- For mutually exclusive options in forms and settings.
- When every option should stay visible, typically two to five choices.

## When not to use

- For independent on or off toggles; use Checkbox or Switch.
- For segmented toolbar-style toggles; use ToggleGroup.
- For more than roughly five options; use Select.

## Do

- Give the group a visible label or an aria-label when no legend is present.
- Use vertical layout by default; switch to horizontal only when space is tight and labels are short.
- Set `size` on `RadioGroup` so all items inherit it; override per item only when needed. Sizes: `sm` (14px), `md` (16px, default), `lg` (20px).

## Don't

- Use checkboxes for single-choice fields; only one option can be selected in a RadioGroup.
