LabeledInput combines a Label and an Input into a single row, wiring the label to the field automatically via the id you provide. It accepts the usual input props such as name, value, onChange, and placeholder.

## When to use

- For standard form fields where every input needs a visible, associated label.
- To keep label and input markup consistent across forms without repeating the wiring.

## When not to use

- When the field needs a custom layout, helper text, or validation message; compose Label and Input directly.
- For non-text controls such as switches or selects, which have their own labelling patterns.
