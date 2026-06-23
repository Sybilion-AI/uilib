ToggleGroup presents a set of related toggle buttons where, in single mode, exactly one option is active at a time. It suits compact, mutually exclusive choices such as alignment or view mode.

## When to use

- To switch between a few mutually exclusive options, such as left, centre, and right alignment.
- For view switches, such as list versus grid, where the choice takes effect immediately.

## When not to use

- For more than roughly five options; use a Select or RadioGroup instead.
- To switch panels of content; use Tabs instead.

## Do

- In single mode, ignore empty values from onValueChange so one option always stays selected.
