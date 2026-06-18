SmartTextTruncate shortens a long string in the middle so it fits its container, keeping the end of the string visible. This preserves distinguishing suffixes such as file extensions or trailing identifiers that a plain end ellipsis would hide.

## When to use

- For long identifiers, file names, or paths where the ending carries meaning.
- In narrow containers, such as table cells or sidebars, where strings of unpredictable length must fit on one line.

## When not to use

- For prose or sentences; standard end truncation reads more naturally.
- When the full value must always be visible; let the text wrap instead.
