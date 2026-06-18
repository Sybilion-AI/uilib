Input is the standard single-line text field. Pair it with a Label linked via htmlFor and id, and control the value through the onChange handler.

## When to use

- To collect short, free-form text such as names, titles, or search terms.
- In forms alongside Label, or use LabeledInput for the common label-plus-input row.

## When not to use

- For multi-line text; use Textarea instead.
- When the value must come from a fixed set of options; use Select or Combobox.

## Do

- Always associate a visible Label so the field is announced correctly by assistive technology.
- Use placeholder text as a hint, not as a substitute for the label.
