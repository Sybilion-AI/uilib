Sheet is a slide-over panel built on the Radix dialog primitive. It opens from a screen edge over the current page and is composed from SheetTrigger, SheetContent, SheetHeader, SheetTitle, and SheetDescription.

## When to use

- For supplementary tasks that keep the underlying page in context, such as editing details or filters.
- On smaller screens where a full dialog would feel cramped and an edge panel works better.

## When not to use

- For short confirmations or alerts; use Dialog or AlertDialog.
- For content that deserves its own page or persistent layout region.

## Do

- Always include SheetTitle and SheetDescription so the panel is announced correctly to screen readers.
